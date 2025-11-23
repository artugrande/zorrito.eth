import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle Farcaster webhook events
    console.log("Farcaster webhook received:", body)
    
    // Process the webhook data here
    // This is a placeholder - implement your webhook logic
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Webhook endpoint is active" })
}

