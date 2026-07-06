import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, discount: '', description: '', error: 'Missing code parameter' },
        { status: 400 }
      );
    }

    const upperCode = code.trim().toUpperCase();

    // Valid codes according to app/data/voucher_store.py
    if (upperCode === 'LEGALAID50') {
      return NextResponse.json({
        success: true,
        discount: '50%',
        description: '50% legal aid discount applied successfully!',
      });
    } else if (upperCode === 'FIRSTMONTHFREE') {
      return NextResponse.json({
        success: true,
        discount: '100%',
        description: 'First month free voucher applied successfully!',
      });
    } else if (upperCode === 'WELCOME100') {
      return NextResponse.json({
        success: true,
        discount: '100%',
        description: 'Welcome voucher applied successfully!',
      });
    }

    return NextResponse.json({
      success: false,
      discount: '',
      description: '',
      error: `Invalid or unrecognized voucher code: "${code}"`,
    });
  } catch (error: any) {
    console.error('Error in /api/voucher route:', error);
    return NextResponse.json(
      { success: false, discount: '', description: '', error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
