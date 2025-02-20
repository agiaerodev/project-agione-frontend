/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';
delete colors['lightBlue'];
delete colors['warmGray'];
delete colors['trueGray'];
delete colors['coolGray'];
delete colors['blueGray'];

const dynamicClasses = [];

const processColor = (color, tone = null) => {
  dynamicClasses.push(`tw-bg-${color}${tone ? `-${tone}` : ''}`);
  dynamicClasses.push(`tw-text-${color}${tone ? `-${tone}` : ''}`);
  dynamicClasses.push(`tw-border-${color}${tone ? `-${tone}` : ''}`);
};

Object.keys(colors).forEach((colorKey) => {
  if (typeof colors[colorKey] === 'object') {
    Object.keys(colors[colorKey]).forEach((tone) => {
      processColor(colorKey, tone);
    });
  } else {
    processColor(colorKey);
  }
});

const breakpointPrefix = ['sm', 'md', 'lg', 'xl', '2xl'];

const colClasses = [
  'tw-col-span-full',
  'sm:tw-col-span-full',
  'md:tw-col-span-full',
  'lg:tw-col-span-full',
  'xl:tw-col-span-full',
  '2xl:tw-col-span-full',
  ...Array.from({ length: 12 }, (_, i) => `tw-col-span-${i + 1}`),
  ...breakpointPrefix.map((prefix) => Array.from({ length: 12 }, (_, i) => `${prefix}:tw-col-span-${i + 1}`)).flat(),

  ...Array.from({ length: 12 }, (_, i) => `tw-col-start-${i + 1}`),
  ...breakpointPrefix.map((prefix) => Array.from({ length: 12 }, (_, i) => `${prefix}:tw-col-start-${i + 1}`)).flat(),

  ...Array.from({ length: 12 }, (_, i) => `tw-col-end-${i + 1}`),
  ...breakpointPrefix.map((prefix) => Array.from({ length: 12 }, (_, i) => `${prefix}:tw-col-end-${i + 1}`)).flat(),
];

module.exports = {
  prefix: 'tw-',
  content: ["./src/**/*.{html,js,ts,vue}"],
  safelist: [...dynamicClasses, ...colClasses],
  theme: {
    extend: {
      colors: {}
    },
  },
  plugins: [],
};
