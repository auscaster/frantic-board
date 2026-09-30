import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import StartupForm from '../../src/components/StartupForm';
import { createStartup } from '../../src/services/api';

jest.mock('../../src/services/api');

describe('StartupForm', () => {
  it('renders correctly', () => {
    const { getByLabelText, getByText } = render(<StartupForm onSuccess={() => {}} />);

    expect(getByLabelText('Name')).toBeInTheDocument();
    expect(getByLabelText('Description')).toBeInTheDocument();
    expect(getByLabelText('Website')).toBeInTheDocument();
    expect(getByLabelText('Email')).toBeInTheDocument();
    expect(getByText('Create Startup')).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    const { getByText } = render(<StartupForm onSuccess={() => {}} />);
    const submitButton = getByText('Create Startup');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('Name is required')).toBeInTheDocument();
      expect(getByText('Description is required')).toBeInTheDocument();
      expect(getByText('Website is required')).toBeInTheDocument();
      expect(getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid inputs', async () => {
    const { getByLabelText, getByText } = render(<StartupForm onSuccess={() => {}} />);

    fireEvent.change(getByLabelText('Website'), { target: { value: 'invalid-url' } });
    fireEvent.change(getByLabelText('Email'), { target: { value: 'invalid-email' } });

    const submitButton = getByText('Create Startup');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('Invalid URL format')).toBeInTheDocument();
      expect(getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('submits the form successfully', async () => {
    const onSuccess = jest.fn();
    const { getByLabelText, getByText } = render(<StartupForm onSuccess={onSuccess} />);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'Test Startup' } });
    fireEvent.change(getByLabelText('Description'), { target: { value: 'Test Description' } });
    fireEvent.change(getByLabelText('Website'), { target: { value: 'https://test.com' } });
    fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } });

    (createStartup as jest.Mock).mockResolvedValueOnce({ id: '1', name: 'Test Startup' });

    const submitButton = getByText('Create Startup');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
