import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Example Test', () => {
  it('should render correctly', () => {
    const { container } = render(<div>Hello World</div>)
    expect(container).toBeInTheDocument()
  })

  it('should find text content', () => {
    render(<div>Hello World</div>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})

