import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Profile from '../Profile'

// Objet stable — évite la boucle infinie dans useEffect([user])
const mockUser = {
  username: 'jean', prenom: 'Jean', nom: 'Dupont',
  email: 'jean@test.com', tel: '0600000000', role: 'User',
}

vi.mock('../../../hooks/useAuth', () => ({
  default: () => ({ user: mockUser, setUser: vi.fn() }),
  useAuth: () => ({ user: mockUser, setUser: vi.fn() }),
}))

vi.mock('../../../api/userApi', () => ({
  getProfil: vi.fn().mockResolvedValue({
    username: 'jean', prenom: 'Jean', nom: 'Dupont',
    email: 'jean@test.com', tel: '0600000000', role: 'User', status: 'ACTIVE',
  }),
  updateProfil: vi.fn().mockResolvedValue({
    username: 'jean', prenom: 'Jean', nom: 'Dupont',
    email: 'jean@test.com', tel: '0600000000', role: 'User', status: 'ACTIVE',
  }),
}))

const renderProfile = () => render(<MemoryRouter><Profile /></MemoryRouter>)

describe('Profile — page', () => {

  it('Profile — affichage : informations utilisateur visibles après chargement', async () => {
    // ARRANGE + ACT
    renderProfile()
    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('jean@test.com')).toBeInTheDocument()
    })
  })

  it('Profile — mode édition : clic Modifier affiche le formulaire avec tous les ids Selenium', async () => {
    // ARRANGE
    renderProfile()
    await waitFor(() => {
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })
    // ACT
    fireEvent.click(screen.getByText('Modifier'))
    // ASSERT
    expect(document.getElementById('profile-form')).toBeInTheDocument()
    expect(document.getElementById('profile-firstname-input')).toBeInTheDocument()
    expect(document.getElementById('profile-lastname-input')).toBeInTheDocument()
    expect(document.getElementById('profile-email-input')).toBeInTheDocument()
    expect(document.getElementById('profile-phone-input')).toBeInTheDocument()
    expect(document.getElementById('profile-save-btn')).toBeInTheDocument()
  })

  it('Profile — accessibilité : labels associés à leurs inputs en mode édition', async () => {
    // ARRANGE
    renderProfile()
    await waitFor(() => {
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })
    // ACT
    fireEvent.click(screen.getByText('Modifier'))
    // ASSERT
    expect(document.querySelector('label[for="profile-firstname-input"]')).toBeInTheDocument()
    expect(document.querySelector('label[for="profile-lastname-input"]')).toBeInTheDocument()
    expect(document.querySelector('label[for="profile-email-input"]')).toBeInTheDocument()
    expect(document.querySelector('label[for="profile-phone-input"]')).toBeInTheDocument()
  })

  it('Profile — annuler : clic Annuler ferme le mode édition et masque le formulaire', async () => {
    // ARRANGE
    renderProfile()
    await waitFor(() => {
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Modifier'))
    expect(document.getElementById('profile-form')).toBeInTheDocument()
    // ACT
    fireEvent.click(screen.getByText('Annuler'))
    // ASSERT
    expect(document.getElementById('profile-form')).not.toBeInTheDocument()
  })

})
