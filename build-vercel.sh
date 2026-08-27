#!/bin/bash
# Script de build para Vercel - asegura que VITE_API_URL no esté definida

unset VITE_API_URL
export VITE_API_URL=""

echo "Building for Vercel without VITE_API_URL..."
npm run build
