import React from 'react';
import { Center, Text, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Map component error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, retryCount: this.state.retryCount + 1 });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Center h="80vh" style={{ flexDirection: 'column', gap: '1rem' }}>
          <Alert icon={<IconAlertCircle size={16} />} title="Map Error" color="red" variant="light">
            <Text size="sm">
              The map failed to load. This might be due to a missing API key or network issues.
            </Text>
            <Text size="xs" c="dimmed" mt="xs">
              Error: {this.state.error?.message || 'Unknown error'}
            </Text>
            {this.state.retryCount < 3 && (
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconRefresh size={14} />}
                onClick={this.handleRetry}
                mt="xs"
              >
                Try Again
              </Button>
            )}
          </Alert>
        </Center>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;