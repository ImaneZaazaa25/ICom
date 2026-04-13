import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductFilters from '../ProductFilters'

const CATEGORIES = [
  { id: 1, nom: 'Sport' },
  { id: 2, nom: 'Mode' },
]

describe('ProductFilters — composant', () => {

  it('ProductFilters — accessibilité : input recherche présent avec le bon id', () => {
    // ARRANGE + ACT
    render(<ProductFilters categories={CATEGORIES} onSearchChange={vi.fn()} onCategoryChange={vi.fn()} onReset={vi.fn()} />)
    // ASSERT
    expect(document.getElementById('filters-search-input')).toBeInTheDocument()
  })

  it('ProductFilters — saisie : onSearchChange appelé avec la valeur tapée', () => {
    // ARRANGE
    const onSearchChange = vi.fn()
    render(<ProductFilters categories={CATEGORIES} onSearchChange={onSearchChange} onCategoryChange={vi.fn()} onReset={vi.fn()} />)
    // ACT
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'nike' } })
    // ASSERT
    expect(onSearchChange).toHaveBeenCalledWith('nike')
  })

  it('ProductFilters — catégories : options rendues dans le select', () => {
    render(<ProductFilters categories={CATEGORIES} onSearchChange={vi.fn()} onCategoryChange={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Sport' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Mode' })).toBeInTheDocument()
  })

  it('ProductFilters — reset : onReset appelé au clic', () => {
    // ARRANGE
    const onReset = vi.fn()
    render(<ProductFilters categories={CATEGORIES} onSearchChange={vi.fn()} onCategoryChange={vi.fn()} onReset={onReset} />)
    // ACT
    fireEvent.click(document.getElementById('filters-reset-btn'))
    // ASSERT
    expect(onReset).toHaveBeenCalledTimes(1)
  })

})
