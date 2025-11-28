import React from 'react';
import { Buffer } from 'buffer';
import process from 'process';
import type { Preview } from '@storybook/react';

import 'bootstrap/dist/css/bootstrap.min.css';

// Setup global polyfills for browser environment
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
  (window as any).process = process;
}


const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
