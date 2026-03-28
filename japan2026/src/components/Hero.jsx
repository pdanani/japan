import { Button, Group, Text, Stack } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

const Blossom = ({ className, size }) => (
  <svg className={`cherry-blossom ${className}`} viewBox="0 0 40 40" width={size} height={size}>
    <circle cx="20" cy="10" r="8" fill="rgba(255,182,193,0.35)" />
    <circle cx="10" cy="25" r="8" fill="rgba(255,182,193,0.3)" />
    <circle cx="30" cy="25" r="8" fill="rgba(255,182,193,0.3)" />
    <circle cx="15" cy="18" r="8" fill="rgba(255,182,193,0.3)" />
    <circle cx="25" cy="18" r="8" fill="rgba(255,182,193,0.3)" />
    <circle cx="20" cy="20" r="4" fill="rgba(255,220,180,0.5)" />
  </svg>
);

export default function Hero({ onSync, syncing }) {
  return (
    <div className="hero">
      <div className="hero-overlay" />
      <Blossom className="cb-1" size={40} />
      <Blossom className="cb-2" size={30} />
      <Blossom className="cb-3" size={24} />
      <div className="hero-content">
        <div style={{
          display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 20, color: '#f5e6c8', fontSize: '0.8rem', fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24,
        }}>
          Summer 2026
        </div>
        <span className="hero-jp">日本</span>
        <span className="hero-en">Japan</span>
        <Text c="rgba(255,255,255,0.8)" size="lg" mt="xs">July 11 – July 25 · 15 Days</Text>
        <Text className="hero-route" mt={4} mb="lg">Tokyo → Osaka → Kyoto → Tokyo</Text>

        <Group justify="center" gap="xl" mb="xl">
          {[['10', 'Travelers'], ['90+', 'Restaurants'], ['60+', 'Activities']].map(([n, l]) => (
            <Stack key={l} gap={0} align="center">
              <Text fw={700} size="xl" c="white">{n}</Text>
              <Text size="xs" c="rgba(255,255,255,0.5)" tt="uppercase" style={{ letterSpacing: '0.08em' }}>{l}</Text>
            </Stack>
          ))}
        </Group>

        <Button
          variant="default"
          leftSection={<IconRefresh size={16} style={syncing ? { animation: 'spin 1s linear infinite' } : {}} />}
          loading={syncing}
          onClick={onSync}
          radius="md"
          styles={{
            root: {
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          Sync from Google Sheets
        </Button>
      </div>
    </div>
  );
}
