import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from '../Register'
import * as userApi from '../../../api/userApi'

vi.mock('../../../api/userApi')
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => vi.fn(),
}))

const renderRegister = () =>
  render(<MemoryRouter><Register /></MemoryRouter>)

describe('Register — page', () => {

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('Register — accessibilité : chaque label est associé à son input', () => {
    renderRegister()
    const inputs = ['register-email-input', 'register-password-input', 'register-username-input']
    inputs.forEach(id => {
      const input = document.getElementById(id)
      const label = document.querySelector(`label[for="${id}"]`)
      expect(input).toBeInTheDocument()
      expect(label).toBeInTheDocument()
    })
  })

  it('Register — ids Selenium : formulaire et bouton présents', () => {
    renderRegister()
    expect(document.getElementById('register-form')).toBeInTheDocument()
    expect(document.getElementById('register-submit-btn')).toBeInTheDocument()
  })

  it('Register — soumission vide : API non appelée', async () => {
    // ARRANGE
    vi.mocked(userApi.register).mockResolvedValue({})

    renderRegister()

    // ACT
    fireEvent.click(document.getElementById('register-submit-btn'))

    // ASSERT
    await waitFor(() => {
      expect(userApi.register).not.toHaveBeenCalled()
    })
  })

  it('Register — erreur API : message d\'erreur affiché', async () => {
    // ARRANGE
    vi.mocked(userApi.register).mockRejectedValue(new Error('Email déjà utilisé'))

    renderRegister()

    fireEvent.change(document.getElementById('register-email-input'), {
      target: { value: 'test@test.com' }
    })

    // ACT
    fireEvent.click(document.getElementById('register-submit-btn'))

    // ASSERT
    await waitFor(() => {
      expect(document.getElementById('register-error-msg')).toBeInTheDocument()
    })
  })

})