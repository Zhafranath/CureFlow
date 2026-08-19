import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'plant-images'

async function getCameraState(userId: string) {
  const fileName = `state_${userId}.json`
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(fileName)

    if (error) {
      // File does not exist yet, return default state
      return {
        trigger: false,
        status: 'idle',
        analysisResult: null,
        timestamp: 0,
        error: null
      }
    }

    const text = await data.text()
    return JSON.parse(text)
  } catch (err) {
    console.error('Error reading camera state from Supabase:', err)
    return {
      trigger: false,
      status: 'idle',
      analysisResult: null,
      timestamp: 0,
      error: null
    }
  }
}

async function saveCameraState(userId: string, state: any) {
  const fileName = `state_${userId}.json`
  try {
    const jsonStr = JSON.stringify(state, null, 2)
    const buffer = Buffer.from(jsonStr, 'utf-8')
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: 'application/json',
        upsert: true
      })

    if (error) {
      console.error('Error uploading state to Supabase:', error)
    }
  } catch (err) {
    console.error('Exception writing camera state to Supabase:', err)
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id') || '00000000-0000-0000-0000-000000000000'

  const state = await getCameraState(userId)
  
  // Timeout safety: if trigger is true but pending for more than 25 seconds, reset it
  if (state.trigger && state.timestamp && Date.now() - state.timestamp > 25000) {
    state.trigger = false
    state.status = 'error'
    state.error = 'Kamera ESP32-CAM offline atau tidak merespon (Timeout)'
    await saveCameraState(userId, state)
  }

  return NextResponse.json(state)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, userId = '00000000-0000-0000-0000-000000000000' } = body

    if (action === 'trigger') {
      const newState = {
        trigger: true,
        status: 'capturing',
        analysisResult: null,
        timestamp: Date.now(),
        error: null
      }
      await saveCameraState(userId, newState)
      return NextResponse.json(newState)
    }

    if (action === 'reset') {
      const newState = {
        trigger: false,
        status: 'idle',
        analysisResult: null,
        timestamp: 0,
        error: null
      }
      await saveCameraState(userId, newState)
      return NextResponse.json(newState)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
