import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders input with placeholder', () => {
    render(<Input name="email" placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('calls onChange handler when value changes', async () => {
    const handleChange = jest.fn();
    render(<Input name="email" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test@example.com');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders with correct value', () => {
    render(<Input name="email" value="test@example.com" onChange={() => {}} />);
    const input = screen.getByDisplayValue('test@example.com');
    expect(input).toBeInTheDocument();
  });

  it('renders as required when required prop is true', () => {
    render(<Input name="email" label="Email" required />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeRequired();
  });

  it('renders with correct type', () => {
    render(<Input name="password" type="password" />);
    const input = screen.getByRole('textbox', { hidden: true });
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders error message when error prop is provided', () => {
    render(<Input name="email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });
});

