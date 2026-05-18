#!/usr/bin/env bun
/**
 * Portal Sync Script
 * Automates fetching student registration data from the SPMB Sumut admin portal
 * using agent-browser CLI for browser automation.
 * 
 * Usage: bun run scripts/portal-sync.ts --email <email> --password <password> [--pages <num>] [--status <status>]
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

interface SyncArgs {
  email: string;
  password: string;
  pages?: number;
  status?: string;
}

function parseArgs(): SyncArgs {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      result[args[i].substring(2)] = args[i + 1];
      i++;
    }
  }
  if (!result.email || !result.password) {
    console.error('Usage: bun run scripts/portal-sync.ts --email <email> --password <password> [--pages <num>] [--status <status>]');
    process.exit(1);
  }
  return {
    email: result.email,
    password: result.password,
    pages: result.pages ? parseInt(result.pages) : undefined,
    status: result.status || 'accepted',
  };
}

function run(cmd: string): string {
  try {
    return execSync(`agent-browser ${cmd}`, {
      timeout: 30000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (e: any) {
    const out = e.stdout?.toString()?.trim() || '';
    const err = e.stderr?.toString()?.trim() || '';
    return out || err || e.message;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Write JS to a temp file and eval it via agent-browser to avoid escaping issues
function evalJs(jsCode: string): string {
  const tmpFile = join(tmpdir(), `portal-eval-${Date.now()}.js`);
  try {
    writeFileSync(tmpFile, jsCode, 'utf-8');
    // agent-browser eval reads from command string, so we use a different approach
    // We'll save the JS as a file and use a wrapper
    const wrappedJs = `JSON.stringify((function(){${jsCode}})())`;
    // For agent-browser eval, we need to pass it as a string argument
    // Use base64 encoding to avoid escaping issues
    const b64 = Buffer.from(wrappedJs).toString('base64');
    return run(`eval "eval(atob('${b64}'))"`);
  } catch (e: any) {
    return '';
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

async function main() {
  const args = parseArgs();

  console.log(JSON.stringify({ step: 'start', message: 'Memulai sinkronisasi portal SPMB...' }));

  // Step 1: Open login page
  run('open "https://adminspmb.disdik.sumutprov.go.id/login"');
  await sleep(3000);
  console.log(JSON.stringify({ step: 'login_page', message: 'Halaman login dibuka' }));

  // Step 2: Get snapshot to find the correct refs
  const loginSnapshot = run('snapshot -i');
  console.log(JSON.stringify({ step: 'login_snapshot', snapshot: loginSnapshot.substring(0, 500) }));

  // Step 3: Find email input, password input, and login button refs
  const emailMatch = loginSnapshot.match(/textbox\s+"?Email"?\s+\[ref=(e\d+)\]/i);
  const passwordMatch = loginSnapshot.match(/textbox\s+"?Password"?\s+\[ref=(e\d+)\]/i);
  const loginBtnMatch = loginSnapshot.match(/button\s+"?Login"?\s+\[ref=(e\d+)\]/i);

  if (!emailMatch || !passwordMatch || !loginBtnMatch) {
    console.log(JSON.stringify({ step: 'error', message: 'Tidak dapat menemukan form login di halaman portal', error: true }));
    run('close');
    process.exit(1);
  }

  const emailRef = emailMatch[1];
  const passwordRef = passwordMatch[1];
  const loginRef = loginBtnMatch[1];

  // Step 4: Fill credentials and login
  run(`fill @${emailRef} "${args.email}"`);
  await sleep(500);
  run(`fill @${passwordRef} "${args.password}"`);
  await sleep(500);
  console.log(JSON.stringify({ step: 'credentials_filled', message: 'Kredensial dimasukkan' }));

  run(`click @${loginRef}`);
  await sleep(4000);
  console.log(JSON.stringify({ step: 'login_clicked', message: 'Tombol login diklik' }));

  // Step 5: Check if login was successful
  const currentUrl = run('get url');
  if (currentUrl.includes('/login')) {
    console.log(JSON.stringify({ step: 'error', message: 'Login gagal. Periksa email dan password Anda.', error: true }));
    run('close');
    process.exit(1);
  }
  console.log(JSON.stringify({ step: 'login_success', message: 'Login berhasil', url: currentUrl }));

  // Step 6: Navigate to registration page
  const statusParam = args.status ? `&status=${args.status}` : '&status=accepted';
  const regUrl = `https://adminspmb.disdik.sumutprov.go.id/admin/registration?search=&limit=10&page=1${statusParam}&user_id=&nisn=&school_major_id=&educational_level_id=&registration_path_id=&registration_sub_path_id=&institution_id=&id=&sort_column=&sort_direction=`;
  run(`open "${regUrl}"`);
  await sleep(3000);
  console.log(JSON.stringify({ step: 'registration_page', message: 'Halaman pendaftaran dibuka' }));

  // Step 7: Extract table data from each page
  const maxPages = args.pages || 100;
  const allData: Record<string, string>[] = [];
  let currentPage = 1;
  let hasMore = true;

  // JS code to extract table data
  const extractTableJs = `
    const rows = document.querySelectorAll('table tbody tr');
    const headers = Array.from(document.querySelectorAll('table thead th')).map(th => th.innerText.trim());
    const data = [];
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        const rowObj = {};
        cells.forEach((cell, i) => {
          if (i < headers.length) {
            rowObj[headers[i]] = cell.innerText.trim();
          }
        });
        data.push(rowObj);
      }
    });
    return { headers, data, rowCount: data.length };
  `;

  while (hasMore && currentPage <= maxPages) {
    console.log(JSON.stringify({ step: 'fetching_page', page: currentPage, message: `Mengambil halaman ${currentPage}...` }));

    const pageDataStr = evalJs(extractTableJs);

    try {
      const pageData = JSON.parse(pageDataStr);
      if (!pageData || pageData.rowCount === 0) {
        hasMore = false;
        console.log(JSON.stringify({ step: 'no_more_data', page: currentPage, message: 'Tidak ada data lagi' }));
      } else {
        allData.push(...pageData.data);
        console.log(JSON.stringify({ step: 'page_data', page: currentPage, rowCount: pageData.rowCount, totalFetched: allData.length }));

        // Try to navigate to next page by changing URL
        if (pageData.rowCount === 10) {
          // There might be more pages - navigate directly
          currentPage++;
          const nextPageUrl = `https://adminspmb.disdik.sumutprov.go.id/admin/registration?search=&limit=10&page=${currentPage}${statusParam}&user_id=&nisn=&school_major_id=&educational_level_id=&registration_path_id=&registration_sub_path_id=&institution_id=&id=&sort_column=&sort_direction=`;
          run(`open "${nextPageUrl}"`);
          await sleep(2500);
        } else {
          // Less than 10 rows means last page
          hasMore = false;
          console.log(JSON.stringify({ step: 'last_page', page: currentPage, message: 'Halaman terakhir tercapai' }));
        }
      }
    } catch (e: any) {
      console.log(JSON.stringify({ step: 'parse_error', page: currentPage, raw: pageDataStr?.substring(0, 300) || 'empty' }));
      hasMore = false;
    }
  }

  // Step 8: Close browser
  run('close');
  console.log(JSON.stringify({ step: 'done', totalFetched: allData.length, data: allData }));
}

main().catch(err => {
  console.error(JSON.stringify({ step: 'fatal_error', message: err.message }));
  try { run('close'); } catch {}
  process.exit(1);
});
