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
it('Register — validation : email invalide affiche erreur', async () => {
  renderRegister()

  // Remplir tous les champs sauf email valide
  fireEvent.change(document.getElementById('register-email-input'), {
    target: { value: 'emailsansarobase' }
  })
  fireEvent.change(document.getElementById('register-password-input'), {
    target: { value: 'motdepasse123' }
  })
  fireEvent.change(document.getElementById('register-phone-input'), {
    target: { value: '0612345678' }
  })

  fireEvent.click(document.getElementById('register-submit-btn'))

  await waitFor(() => {
    expect(document.getElementById('register-error-msg')).toBeInTheDocument()
    expect(document.getElementById('register-error-msg').textContent).toContain('email')
  })
})

it('Register — validation : mot de passe trop court affiche erreur', async () => {
  renderRegister()

  fireEvent.change(document.getElementById('register-email-input'), {
    target: { value: 'test@test.com' }
  })
  fireEvent.change(document.getElementById('register-password-input'), {
    target: { value: '123' }
  })
  fireEvent.change(document.getElementById('register-phone-input'), {
    target: { value: '0612345678' }
  })

  fireEvent.click(document.getElementById('register-submit-btn'))

  await waitFor(() => {
    expect(document.getElementById('register-error-msg').textContent).toContain('6')
  })
})

it('Register — validation : téléphone invalide affiche erreur', async () => {
  renderRegister()

  fireEvent.change(document.getElementById('register-email-input'), {
    target: { value: 'test@test.com' }
  })
  fireEvent.change(document.getElementById('register-password-input'), {
    target: { value: 'motdepasse123' }
  })
  fireEvent.change(document.getElementById('register-phone-input'), {
    target: { value: '123' } // invalide
  })

  fireEvent.click(document.getElementById('register-submit-btn'))

  await waitFor(() => {
    expect(document.getElementById('register-error-msg').textContent).toContain('téléphone')
  })
})

it('Register — force du mot de passe : affiche weak/medium/strong', async () => {
  renderRegister()
  const passwordInput = document.getElementById('register-password-input')

  // Mot de passe faible
  fireEvent.change(passwordInput, { target: { value: 'abc' } })
  await waitFor(() => {
    expect(document.querySelector('.strength-weak')).toBeInTheDocument()
  })

  // Mot de passe moyen
  fireEvent.change(passwordInput, { target: { value: 'Abcdef1' } })
  await waitFor(() => {
    expect(document.querySelector('.strength-medium')).toBeInTheDocument()
  })

  // Mot de passe fort
  fireEvent.change(passwordInput, { target: { value: 'Abcdef1@!' } })
  await waitFor(() => {
    expect(document.querySelector('.strength-strong')).toBeInTheDocument()
  })
})

it('Register — succès : message de succès affiché après inscription', async () => {
  vi.mocked(userApi.register).mockResolvedValue({})
  renderRegister()

  fireEvent.change(document.getElementById('register-lastname-input'), {
    target: { value: 'Dupont' }
  })
  fireEvent.change(document.getElementById('register-firstname-input'), {
    target: { value: 'Jean' }
  })
  fireEvent.change(document.getElementById('register-username-input'), {
    target: { value: 'jeandupont' }
  })
  fireEvent.change(document.getElementById('register-email-input'), {
    target: { value: 'jean@test.com' }
  })
  fireEvent.change(document.getElementById('register-phone-input'), {
    target: { value: '0612345678' }
  })
  fireEvent.change(document.getElementById('register-password-input'), {
    target: { value: 'Motdepasse1!' }
  })

  fireEvent.click(document.getElementById('register-submit-btn'))

  await waitFor(() => {
    expect(document.querySelector('.success-message')).toBeInTheDocument()
  })
})
it('Register — validation : email invalide affiche erreur', async () => {
  renderRegister()
  fireEvent.change(document.getElementById('register-email-input'), {
    target: { value: 'emailsansarobase' }
  })
  fireEvent.change(document.getElementById('register-password-input'), {
    target: { value: 'motdepasse123' }
  })
  fireEvent.change(document.getElementById('register-phone-input'), {
    target: { value: '0612345678' }
  })
  fireEvent.click(document.getElementById('register-submit-btn'))
  await waitFor(() => {
    expect(document.getElementById('register-error-msg').textContent).toContain('email')
  })
})

it('Register — validation : mot de passe trop court', async () => {
  renderRegister()
  fireEvent.change(document.getElementById('register-email-input'), {
    target: { value: 'test@test.com' }
  })
  fireEvent.change(document.getElementById('register-password-input'), {
    target: { value: '123' }
  })
  fireEvent.change(document.getElementById('register-phone-input'), {
    target: { value: '0612345678' }
  })
  fireEvent.click(document.getElementById('register-submit-btn'))
  await waitFor(() => {
    expect(document.getElementById('register-error-msg').textContent).toContain('6')
  })
})

it('Register — validation : téléphone invalide', async () => {
  renderRegister()
  fireEvent.change(document.getElementById('register-email-input'), {
    target: { value: 'test@test.com' }
  })
  fireEvent.change(document.getElementById('register-password-input'), {
    target: { value: 'motdepasse123' }
  })
  fireEvent.change(document.getElementById('register-phone-input'), {
    target: { value: '123' }
  })
  fireEvent.click(document.getElementById('register-submit-btn'))
  await waitFor(() => {
    expect(document.getElementById('register-error-msg').textContent).toContain('téléphone')
  })
})

it('Register — force du mot de passe : weak / medium / strong', async () => {
  renderRegister()
  const input = document.getElementById('register-password-input')

  fireEvent.change(input, { target: { value: 'abc' } })
  await waitFor(() => expect(document.querySelector('.strength-weak')).toBeInTheDocument())

  fireEvent.change(input, { target: { value: 'Abcdef1' } })
  await waitFor(() => expect(document.querySelector('.strength-medium')).toBeInTheDocument())

  fireEvent.change(input, { target: { value: 'Abcdef1@!' } })
  await waitFor(() => expect(document.querySelector('.strength-strong')).toBeInTheDocument())
})

it('Register — succès : message affiché après inscription réussie', async () => {
  vi.mocked(userApi.register).mockResolvedValue({})
  renderRegister()

  fireEvent.change(document.getElementById('register-lastname-input'), { target: { value: 'Dupont' } })
  fireEvent.change(document.getElementById('register-firstname-input'), { target: { value: 'Jean' } })
  fireEvent.change(document.getElementById('register-username-input'), { target: { value: 'jeandupont' } })
  fireEvent.change(document.getElementById('register-email-input'), { target: { value: 'jean@test.com' } })
  fireEvent.change(document.getElementById('register-phone-input'), { target: { value: '0612345678' } })
  fireEvent.change(document.getElementById('register-password-input'), { target: { value: 'Motdepasse1!' } })

  fireEvent.click(document.getElementById('register-submit-btn'))
  await waitFor(() => {
    expect(document.querySelector('.success-message')).toBeInTheDocument()
  })
})