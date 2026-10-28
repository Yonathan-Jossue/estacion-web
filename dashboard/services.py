"""Lectura de la tabla tabla_sensores desde Supabase (API REST)."""
import os

import requests


class SupabaseError(Exception):
    pass


def obtener_lecturas(limite=20):
    url_base = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_KEY", "")

    if not url_base or not key:
        raise SupabaseError(
            "Faltan las variables SUPABASE_URL y SUPABASE_KEY. "
            "Revisa la configuración de tu terminal."
        )

    headers = {"apikey": key, "Authorization": f"Bearer {key}"}
    params = {"select": "*", "order": "created_at.desc", "limit": limite}

    try:
        respuesta = requests.get(
            f"{url_base}/rest/v1/tabla_sensores",
            headers=headers,
            params=params,
            timeout=10,
        )
    except requests.RequestException as e:
        raise SupabaseError(f"No se pudo conectar con Supabase: {e}")

    if respuesta.status_code != 200:
        raise SupabaseError(
            f"Supabase respondió con error {respuesta.status_code}: {respuesta.text[:200]}"
        )

    return respuesta.json()
