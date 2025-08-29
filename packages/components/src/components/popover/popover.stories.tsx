import type { Meta, StoryObj } from '@storybook/react';

import { Popover } from './popover';

const meta: Meta<typeof Popover> = {
  title: 'Popover',
  component: Popover,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: <div style={{ padding: 8 }}>This is content</div>,
    children: <span style={{ marginLeft: 100 }}>Click me.</span>,
    open: true,
    onOpenChange: () => {
      //
    },
  },
};
