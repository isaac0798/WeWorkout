const MillionLint = require('@million/lint');
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true
});
module.exports = MillionLint.next()(withPWA({
  reactStrictMode: true
}));