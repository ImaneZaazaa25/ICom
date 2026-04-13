import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../Navbar'

const mockLogout = vi.fn()

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { username: 'jean' }, logout: mockLogout }),
}))

vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({ cartItems: [{ id: 1 }, { id: 2 }] }),
}))

const renderNavbar = () => render(<MemoryRouter><Navbar /></MemoryRouter>)

describe('Navbar — composant', () => {

  beforeEach(() => { vi.clearAllMocks() })

  it('Navbar — liens principaux : nav-home-link et nav-products-link présents', () => {
    // ARRANGE + ACT
    renderNavbar()
    // ASSERT
    expect(document.getElementById('nav-home-link')).toBeInTheDocument()
    expect(document.getElementById('nav-products-link')).toBeInTheDocument()
  })

  it('Navbar — client connecté : nav-cart-link et nav-profile-link présents', () => {
    // ARRANGE + ACT
    renderNavbar()
    // ASSERT
    expect(document.getElementById('nav-cart-link')).toBeInTheDocument()
    expect(document.getElementById('nav-profile-link')).toBeInTheDocument()
  })

  it('Navbar — badge panier : nav-cart-badge affiche le bon nombre d\'articles', () => {
    // ARRANGE + ACT
    renderNavbar()
    // ASSERT
    const badge = document.getElementById('nav-cart-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('2')
  })

  it('Navbar — déconnexion : clic sur nav-logout-btn appelle logout()', () => {
    // ARRANGE
    renderNavbar()
    // ACT
    fireEvent.click(document.getElementById('nav-logout-btn'))
    // ASSERT
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

})
