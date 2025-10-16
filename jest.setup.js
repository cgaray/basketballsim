import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream } from 'stream/web'

// Polyfill for Next.js web APIs
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.ReadableStream = ReadableStream

// Polyfill Request, Response, Headers for Next.js API routes
// Use a more compatible approach for Next.js
const { Request: NodeRequest } = require('node-fetch')
if (typeof global.Request === 'undefined' || global.Request.toString().includes('[native code]')) {
  global.Request = NodeRequest
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || 'OK'
      this.headers = new Headers(init?.headers)
      this.ok = this.status >= 200 && this.status < 300
    }

    async json() {
      return JSON.parse(this.body)
    }

    async text() {
      return this.body
    }
  }
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this.map = new Map()
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.map.set(key.toLowerCase(), value)
        })
      }
    }

    get(name) {
      return this.map.get(name.toLowerCase()) || null
    }

    set(name, value) {
      this.map.set(name.toLowerCase(), value)
    }

    has(name) {
      return this.map.has(name.toLowerCase())
    }

    delete(name) {
      this.map.delete(name.toLowerCase())
    }

    forEach(callback) {
      this.map.forEach((value, key) => callback(value, key, this))
    }
  }
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    player: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    team: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    match: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
  checkDatabaseConnection: jest.fn(),
  closeDatabaseConnection: jest.fn(),
  withTransaction: jest.fn(),
  initializeDatabase: jest.fn(),
}))
