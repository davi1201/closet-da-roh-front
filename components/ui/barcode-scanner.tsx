import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { motion } from 'framer-motion';
import { Button, Center, Overlay, Text } from '@mantine/core';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose?: () => void;
}

export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reader] = useState(() => new BrowserMultiFormatReader());
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const startScanner = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();

        if (!devices.length) {
          setError('Nenhuma câmera encontrada.');
          return;
        }

        const selectedDeviceId = devices[devices.length - 1].deviceId; // geralmente câmera traseira

        await reader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error, controls) => {
            if (result && active) {
              const code = result.getText();
              setIsScanning(false);
              controls?.stop();
              onDetected(code);
              onClose?.();
            }
          }
        );

        setIsScanning(true);
      } catch (err) {
        console.error(err);
        setError('Erro ao acessar a câmera.');
      }
    };

    startScanner();

    return () => {
      active = false;
      //@ts-ignore
      reader.stopContinuousDecode?.();
    };
  }, [reader, onDetected, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'black',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)', // espelha como câmera frontal, mas para trás fica natural
        }}
      />

      {/* Overlay de mira */}
      <Overlay opacity={0.3} color="black" />

      <Center
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '60%',
          height: 120,
          transform: 'translate(-50%, -50%)',
          border: '2px solid white',
          borderRadius: 8,
        }}
      />

      {/* Animação de scanning */}
      {isScanning && (
        <motion.div
          initial={{ top: 'calc(50% - 60px)' }}
          animate={{ top: 'calc(50% + 60px)' }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            position: 'absolute',
            left: '20%',
            width: '60%',
            height: 2,
            backgroundColor: 'red',
          }}
        />
      )}

      {/* Barra inferior */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {error && <Text c="red">{error}</Text>}

        <Button color="gray" onClick={onClose} variant="light">
          Fechar
        </Button>
      </div>
    </div>
  );
}
