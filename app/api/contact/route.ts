import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase/supabase';
import { redis } from '@/lib/redis';

// Lazy initialization to avoid crash when env var is missing
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const RATE_LIMIT_KEY = 'contact_rate_limit';
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 5;

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() ?? 'unknown';
}

async function isRateLimited(ip: string): Promise<boolean> {
  const key = `${RATE_LIMIT_KEY}:${ip}`;
  const currentCount = await redis.get<number>(key);

  if (currentCount && currentCount >= RATE_LIMIT_MAX) {
    return true;
  }

  await redis.incr(key);
  await redis.expire(key, RATE_LIMIT_WINDOW);
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, message, website } = body;

    // Honeypot check - if filled, it's likely a bot
    if (website) {
      // Silently accept to not alert bots
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Store in Supabase
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          ip_address: ip,
        },
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Send email via Resend
    const contactEmail = process.env.CONTACT_EMAIL;
    const resendClient = getResend();
    if (contactEmail && resendClient) {
      const { error: emailError } = await resendClient.emails.send({
        from: 'Contact Form <onboarding@resend.dev>',
        to: contactEmail,
        subject: `New Contact Form Submission from ${name.trim()}`,
        text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`,
        replyTo: email.trim(),
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the request if email fails - submission is already saved
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
