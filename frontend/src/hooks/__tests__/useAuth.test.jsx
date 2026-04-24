import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthProvider, AuthContext, useAuth } from '../../context/AuthContext'
import * as api from '../../services/api'

// ✅ CORRECTION : chemin corrigé '../../services/api' (était '../services/api')
vi.mock('../../services/api', () => ({
  signin: vi.fn(),
  signup: vi.fn(),
}))

// ─── helpers ────────────────────────────────────────────────────────────────

/** Crée un JWT minimaliste encodé en base64 */
function makeToken(payload) {
  const encoded = btoa(JSON.stringify(payload))
  return `header.${encoded}.signature`
}

function makeValidToken(extra = {}) {
  return makeToken({ sub: 'jdoe', roles: ['User'], exp: Math.floor(Date.now() / 1000) + 3600, ...extra })
}

function makeExpiredToken() {
  return makeToken({ sub: 'jdoe', roles: ['User'], exp: Math.floor(Date.now() / 1000) - 10 })
}

/** Composant helper pour lire le contexte dans les tests */
function AuthConsumer({ onValue }) {
  const ctx = useAuth()
  onValue(ctx)
  return null
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('AuthContext — decodeToken & restoreUser', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ── restoreUser ──────────────────────────────────────────────────────────

  it('restoreUser — pas de token : user est null au démarrage', () => {
    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )
    expect(ctx.user).toBeNull()
  })

  it('restoreUser — token valide en localStorage : user est restauré', () => {
    const token = makeValidToken({ sub: 'alice', roles: ['Admin'] })
    localStorage.setItem('token', token)
    localStorage.setItem('username', 'alice')
    localStorage.setItem('roles', 'Admin')

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    expect(ctx.user).not.toBeNull()
    expect(ctx.user.username).toBe('alice')
    expect(ctx.user.role).toBe('Admin')
    expect(ctx.user.token).toBe(token)
  })

  it('restoreUser — token expiré : user null et localStorage nettoyé', () => {
    localStorage.setItem('token', makeExpiredToken())
    localStorage.setItem('username', 'bob')
    localStorage.setItem('roles', 'User')

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    expect(ctx.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('username')).toBeNull()
  })

  it('restoreUser — token malformé : user null, pas d\'exception', () => {
    localStorage.setItem('token', 'not.a.valid.jwt')

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    expect(ctx.user).toBeNull()
  })

  // ── fallback username/role ────────────────────────────────────────────────

  it('restoreUser — username absent en localStorage : utilise payload.sub', () => {
    const token = makeValidToken({ sub: 'charlie', roles: ['User'] })
    localStorage.setItem('token', token)
    // pas de username ni roles en localStorage

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    expect(ctx.user.username).toBe('charlie')
  })

  it('restoreUser — role via payload.role (pas roles[]) : correctement lu', () => {
    const token = makeToken({ sub: 'dave', role: 'Manager', exp: Math.floor(Date.now() / 1000) + 3600 })
    localStorage.setItem('token', token)

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    expect(ctx.user.role).toBe('Manager')
  })
})

// ─── login ──────────────────────────────────────────────────────────────────

describe('AuthContext — login', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('login — succès : user mis à jour, localStorage rempli', async () => {
    const token = makeValidToken({ sub: 'eve', roles: ['User'] })
    api.signin.mockResolvedValue(token)

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    await act(async () => {
      await ctx.login('eve', 'pass123')
    })

    expect(ctx.user).not.toBeNull()
    expect(ctx.user.username).toBe('eve')
    expect(localStorage.getItem('token')).toBe(token)
    expect(localStorage.getItem('username')).toBe('eve')
  })

  it('login — retourne { token, role }', async () => {
    const token = makeValidToken({ sub: 'frank', roles: ['Admin'] })
    api.signin.mockResolvedValue(token)

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    let result
    await act(async () => {
      result = await ctx.login('frank', 'secret')
    })

    expect(result.token).toBe(token)
    expect(result.role).toBe('Admin')
  })

  it('login — token null : lève une erreur', async () => {
    api.signin.mockResolvedValue(null)

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    await expect(
      act(async () => { await ctx.login('grace', 'bad') })
    ).rejects.toThrow('Token non reçu')
  })

  it('login — role via payload.authorities[0] quand roles absent', async () => {
    const token = makeToken({ sub: 'henry', authorities: ['SuperAdmin'], exp: Math.floor(Date.now() / 1000) + 3600 })
    api.signin.mockResolvedValue(token)

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    let result
    await act(async () => {
      result = await ctx.login('henry', 'pw')
    })

    expect(result.role).toBe('SuperAdmin')
  })

  it('login — echec réseau : propage l\'erreur', async () => {
    api.signin.mockRejectedValue(new Error('Network Error'))

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    await expect(
      act(async () => { await ctx.login('ivan', 'pw') })
    ).rejects.toThrow('Network Error')
  })
})

// ─── logout ─────────────────────────────────────────────────────────────────

describe('AuthContext — logout', () => {

  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('logout — vide user et nettoie localStorage', async () => {
    const token = makeValidToken({ sub: 'judy', roles: ['User'] })
    api.signin.mockResolvedValue(token)

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    await act(async () => { await ctx.login('judy', 'pw') })
    expect(ctx.user).not.toBeNull()

    act(() => { ctx.logout() })

    expect(ctx.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('username')).toBeNull()
    expect(localStorage.getItem('roles')).toBeNull()
  })
})

// ─── register ───────────────────────────────────────────────────────────────

describe('AuthContext — register', () => {

  beforeEach(() => vi.clearAllMocks())

  it('register — appelle signup avec les bons paramètres', async () => {
    api.signup.mockResolvedValue({ id: 99 })

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    const userData = {
      nom: 'Dupont', prenom: 'Jean', username: 'jdupont',
      email: 'j@d.fr', tel: '0600', motdepasse: 'abc', role: 'User', status: 'ACTIVE',
    }

    await act(async () => { await ctx.register(userData) })

    expect(api.signup).toHaveBeenCalledWith(userData)
  })

  it('register — champs optionnels absents : valeurs par défaut envoyées', async () => {
    api.signup.mockResolvedValue({})

    let ctx
    render(
      <AuthProvider>
        <AuthConsumer onValue={v => { ctx = v }} />
      </AuthProvider>
    )

    await act(async () => {
      await ctx.register({ username: 'min', email: 'm@m.fr', motdepasse: 'pw' })
    })

    expect(api.signup).toHaveBeenCalledWith(
      expect.objectContaining({ nom: '', prenom: '', tel: '', role: 'User', status: 'ACTIVE' })
    )
  })
})

// ─── useAuth ────────────────────────────────────────────────────────────────

describe('useAuth — hors Provider', () => {
  it('retourne un objet vide (pas de crash) quand utilisé hors AuthProvider', () => {
    let ctx
    function Bare() { ctx = useAuth(); return null }
    render(<Bare />)
    expect(ctx).toEqual({})
  })
})