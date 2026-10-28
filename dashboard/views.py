from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from .services import SupabaseError, obtener_lecturas

LIMITE_GRAFICA = 100


def _formatear(lectura):
    """Convierte la fecha de Supabase (UTC) a la hora local de Guatemala."""
    dt = parse_datetime(lectura.get("created_at") or "")
    if dt is not None:
        lectura["fecha"] = timezone.localtime(dt).strftime("%d/%m/%Y %H:%M:%S")
    else:
        lectura["fecha"] = "--"
    return lectura


def _serie_grafica(lecturas):
    """Arma las listas para la gráfica, en orden cronológico (de más viejo a más nuevo)."""
    orden = list(reversed(lecturas))
    return {
        "etiquetas": [l["fecha"][11:16] for l in orden],
        "temperatura": [l.get("temperatura") for l in orden],
        "humedad": [l.get("humedad") for l in orden],
        "humedad_suelo": [l.get("humedad_suelo") for l in orden],
    }


def index(request):
    error = None
    lecturas = []
    try:
        lecturas = [_formatear(l) for l in obtener_lecturas(LIMITE_GRAFICA)]
    except SupabaseError as e:
        error = str(e)

    return render(request, "dashboard/index.html", {
        "ultima": lecturas[0] if lecturas else None,
        "historial": lecturas[:10],
        "grafica": _serie_grafica(lecturas),
        "error": error,
    })


def api_ultima(request):
    """La página consulta esto cada pocos segundos para las tarjetas."""
    try:
        lecturas = obtener_lecturas(1)
    except SupabaseError as e:
        return JsonResponse({"error": str(e)}, status=502)

    ultima = _formatear(lecturas[0]) if lecturas else None
    return JsonResponse({"ultima": ultima})


def api_historial(request):
    """La página consulta esto para refrescar la gráfica."""
    try:
        lecturas = [_formatear(l) for l in obtener_lecturas(LIMITE_GRAFICA)]
    except SupabaseError as e:
        return JsonResponse({"error": str(e)}, status=502)

    return JsonResponse({"grafica": _serie_grafica(lecturas)})
