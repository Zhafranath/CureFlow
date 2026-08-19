import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const STATE_DIR = path.join(process.cwd(), 'public', 'images')
const STATE_FILE = path.join(STATE_DIR, 'camera_state.json')

function ensureDirExists() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true })
  }
}

function getCameraState() {
  ensureDirExists()
  if (fs.existsSync(STATE_FILE)) {
    try {
      const data = fs.readFileSync(STATE_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      // Fallback if parsing failed or file is empty
    }
  }
  return {
    trigger: false,
    status: 'idle',
    analysisResult: null,
    timestamp: 0,
    error: null
  }
}

function saveCameraState(state: any) {
  ensureDirExists()
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8')
}

export async function GET() {
  const state = getCameraState()
  
  // Timeout safety: if trigger is true but pending for more than 25 seconds, reset it
  if (state.trigger && state.timestamp && Date.now() - state.timestamp > 25000) {
    state.trigger = false
    state.status = 'error'
    state.error = 'Kamera ESP32-CAM offline atau tidak merespon (Timeout)'
    saveCameraState(state)
  }

  return NextResponse.json(state)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'trigger') {
      const newState = {
        trigger: true,
        status: 'capturing',
        analysisResult: null,
        timestamp: Date.now(),
        error: null
      }
      saveCameraState(newState)
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
      saveCameraState(newState)
      return NextResponse.json(newState)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
