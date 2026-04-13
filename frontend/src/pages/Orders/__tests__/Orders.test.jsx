import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Orders from '../Orders'

const mockGetMesCommandes = vi.fn()
const mockUser = { username: 'jean' }

vi.mock('../../../api/commandeApi', () => ({
  getMesCommandes: (...args) => mockGetMesCommandes(...args),
}))

vi.mock('../../../hooks/useAuth', () => ({
  default: () => ({ user: mockUser }),
  useAuth: () => ({ user: mockUser }),
}))

const renderOrders = () => render(<MemoryRouter><Orders /></MemoryRouter>)

describe('Orders — page', () => {

  beforeEach(() => { vi.clearAllMocks() })

  it('Orders — vide : orders-list-container et orders-empty-msg présents', async () => {
    // ARRANGE
    mockGetMesCommandes.mockResolvedValue([])
    // ACT
    renderOrders()
    // ASSERT
    await waitFor(() => {
      expect(document.getElementById('orders-list-container')).toBeInTheDocument()
      expect(document.getElementById('orders-empty-msg')).toBeInTheDocument()
    })
  })

  it('Orders — une commande : ids order-card-50, order-total-50, order-status-50, order-date-50 présents', async () => {
    // ARRANGE
    mockGetMesCommandes.mockResolvedValue([
      { id: 50, dateCommande: '2024-01-15T10:00:00', etat: 'EN_COURS', total: 99.99, lignes: [] },
    ])
    // ACT
    renderOrders()
    // ASSERT
    await waitFor(() => {
      expect(document.getElementById('order-card-50')).toBeInTheDocument()
      expect(document.getElementById('order-total-50')).toBeInTheDocument()
      expect(document.getElementById('order-status-50')).toBeInTheDocument()
      expect(document.getElementById('order-date-50')).toBeInTheDocument()
    })
  })

  it('Orders — plusieurs commandes : toutes les cartes rendues avec leurs ids', async () => {
    // ARRANGE
    mockGetMesCommandes.mockResolvedValue([
      { id: 10, dateCommande: '2024-01-15T10:00:00', etat: 'VALIDEE', total: 50, lignes: [] },
      { id: 20, dateCommande: '2024-01-16T10:00:00', etat: 'EN_COURS', total: 30, lignes: [] },
    ])
    // ACT
    renderOrders()
    // ASSERT
    await waitFor(() => {
      expect(document.getElementById('order-card-10')).toBeInTheDocument()
      expect(document.getElementById('order-card-20')).toBeInTheDocument()
    })
  })

})
