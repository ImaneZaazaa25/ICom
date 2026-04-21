import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'

const mockLogin = vi.fn()

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin, error: null, loading: false }),
}))

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => vi.fn(),
}))

const renderLogin = () => render(<MemoryRouter><Login /></MemoryRouter>)

describe('Login — page', () => {

  beforeEach(() => { vi.clearAllMocks() })

  it('Login — formulaire : id="login-form" présent dans le DOM', () => {
    // ARRANGE + ACT
    renderLogin()
    // ASSERT
    expect(document.getElementById('login-form')).toBeInTheDocument()
  })

  it('Login — accessibilité : labels associés aux inputs username et password', () => {
    // ARRANGE + ACT
    renderLogin()
    // ASSERT
    expect(document.querySelector('label[for="login-username-input"]')).toBeInTheDocument()
    expect(document.querySelector('label[for="login-password-input"]')).toBeInTheDocument()
  })

  it('Login — ids Selenium : tous les ids requis présents dans le DOM', () => {
    // ARRANGE + ACT
    renderLogin()
    // ASSERT
    expect(document.getElementById('login-username-input')).toBeInTheDocument()
    expect(document.getElementById('login-password-input')).toBeInTheDocument()
    expect(document.getElementById('login-submit-btn')).toBeInTheDocument()
    expect(document.getElementById('login-register-link')).toBeInTheDocument()
  })

  it('Login — saisie : valeurs mises à jour dans les champs', () => {
    // ARRANGE
    renderLogin()
    const usernameInput = document.getElementById('login-username-input')
    const passwordInput = document.getElementById('login-password-input')
    // ACT
    fireEvent.change(usernameInput, { target: { value: 'jean' } })
    fireEvent.change(passwordInput, { target: { value: 'secret' } })
    // ASSERT
    expect(usernameInput.value).toBe('jean')
    expect(passwordInput.value).toBe('secret')
  })

  it('Login — soumission : login() appelé avec les bonnes valeurs', async () => {
    // ARRANGE
    mockLogin.mockRejectedValue(new Error('Erreur test'))
    renderLogin()
    fireEvent.change(document.getElementById('login-username-input'), { target: { value: 'jean' } })
    fireEvent.change(document.getElementById('login-password-input'), { target: { value: 'secret' } })
    // ACT
    fireEvent.click(document.getElementById('login-submit-btn'))
    // ASSERT
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('jean', 'secret')
    })
  })

})
