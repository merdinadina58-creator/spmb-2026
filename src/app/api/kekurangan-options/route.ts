import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SETTING_KEY = 'custom_kekurangan';

// GET custom kekurangan options
export async function GET() {
  try {
    const setting = await db.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    const custom: string[] = setting ? JSON.parse(setting.value) : [];
    return NextResponse.json({ custom });
  } catch (error) {
    console.error('Error fetching kekurangan options:', error);
    return NextResponse.json({ custom: [] });
  }
}

// POST - add a new custom kekurangan option
export async function POST(request: NextRequest) {
  try {
    const { option } = await request.json() as { option: string };
    if (!option || !option.trim()) {
      return NextResponse.json({ error: 'Option is required' }, { status: 400 });
    }

    const trimmed = option.trim();

    const setting = await db.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    let custom: string[] = setting ? JSON.parse(setting.value) : [];

    if (!custom.includes(trimmed)) {
      custom.push(trimmed);
      await db.setting.upsert({
        where: { key: SETTING_KEY },
        update: { value: JSON.stringify(custom) },
        create: { key: SETTING_KEY, value: JSON.stringify(custom) },
      });
    }

    return NextResponse.json({ custom });
  } catch (error) {
    console.error('Error adding kekurangan option:', error);
    return NextResponse.json({ error: 'Failed to add option' }, { status: 500 });
  }
}

// DELETE - remove a custom kekurangan option
export async function DELETE(request: NextRequest) {
  try {
    const { option } = await request.json() as { option: string };
    if (!option || !option.trim()) {
      return NextResponse.json({ error: 'Option is required' }, { status: 400 });
    }

    const trimmed = option.trim();

    const setting = await db.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    let custom: string[] = setting ? JSON.parse(setting.value) : [];
    custom = custom.filter(c => c !== trimmed);

    await db.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value: JSON.stringify(custom) },
      create: { key: SETTING_KEY, value: JSON.stringify(custom) },
    });

    return NextResponse.json({ custom });
  } catch (error) {
    console.error('Error deleting kekurangan option:', error);
    return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 });
  }
}
