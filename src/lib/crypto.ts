// ============================================================
// Cifrado RSA-OAEP SHA-256 con Web Crypto API
// Se usa en el cliente (browser) para cifrar contraseñas antes de enviarlas
// ============================================================

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:8081/bff'
const BFF_API_KEY = process.env.NEXT_PUBLIC_BFF_API_KEY ?? 'bff-dev-secret-2026'

/**
 * Obtiene la clave pública RSA del BFF y cifra la contraseña.
 * Devuelve la contraseña cifrada en base64.
 */
export async function encryptPassword(plainPassword: string): Promise<string> {
  // 1. Obtener la clave pública del BFF
  const res = await fetch(`${BFF_URL}/auth/public-key`, {
    headers: {
      'X-API-Key': BFF_API_KEY,
    },
  })

  if (!res.ok) {
    throw new Error('No se pudo obtener la clave pública del servidor')
  }

  const { publicKey } = (await res.json()) as { publicKey: string }

  // 2. Decodificar la clave pública DER base64
  const keyBytes = Uint8Array.from(atob(publicKey), (c) => c.charCodeAt(0))

  // 3. Importar la clave pública con formato SPKI
  const pubKey = await crypto.subtle.importKey(
    'spki',
    keyBytes.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )

  // 4. Cifrar la contraseña con RSA-OAEP
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    pubKey,
    new TextEncoder().encode(plainPassword)
  )

  // 5. Convertir el ArrayBuffer a base64
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}
