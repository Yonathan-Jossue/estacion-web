const INTERVALO_TARJETAS_MS = 5000;
const INTERVALO_GRAFICA_MS = 15000;

let grafica = null;

function poner(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = (valor === null || valor === undefined) ? "--" : valor;
}

function crearGrafica(datos) {
  const ctx = document.getElementById("grafica");
  if (!ctx || !datos.etiquetas.length) return;

  grafica = new Chart(ctx, {
    type: "line",
    data: {
      labels: datos.etiquetas,
      datasets: [
        {
          label: "Temperatura (°C)",
          data: datos.temperatura,
          borderColor: "#1e88e5",
          backgroundColor: "rgba(30, 136, 229, 0.12)",
          fill: true,
          tension: 0.35,
          yAxisID: "y",
        },
        {
          label: "Humedad aire (%)",
          data: datos.humedad,
          borderColor: "#4fc3f7",
          tension: 0.35,
          yAxisID: "y1",
        },
        {
          label: "H suelo (%)",
          data: datos.humedad_suelo,
          borderColor: "#0d47a1",
          borderDash: [6, 4],
          tension: 0.35,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8, color: "#6b8299" } },
        y: {
          position: "left",
          title: { display: true, text: "°C", color: "#6b8299" },
          grid: { color: "#eef4fa" },
          ticks: { color: "#6b8299" },
        },
        y1: {
          position: "right",
          min: 0,
          max: 100,
          title: { display: true, text: "%", color: "#6b8299" },
          grid: { drawOnChartArea: false },
          ticks: { color: "#6b8299" },
        },
      },
    },
  });
}

function actualizarGrafica(datos) {
  if (!grafica) {
    crearGrafica(datos);
    return;
  }
  grafica.data.labels = datos.etiquetas;
  grafica.data.datasets[0].data = datos.temperatura;
  grafica.data.datasets[1].data = datos.humedad;
  grafica.data.datasets[2].data = datos.humedad_suelo;
  grafica.update();
}

async function actualizarTarjetas() {
  const estado = document.getElementById("estado");
  try {
    const respuesta = await fetch("/api/ultima/");
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      estado.textContent = "Error de conexión";
      return;
    }

    const u = datos.ultima;
    if (!u) {
      estado.textContent = "Sin datos";
      return;
    }

    poner("t-temp", u.temperatura);
    poner("t-hum", u.humedad);
    poner("t-suelo", u.humedad_suelo);
    poner("t-fecha", u.fecha);

    const techo = document.getElementById("t-techo");
    techo.textContent = u.estado_techo || "--";
    techo.className = u.estado_techo === "ABIERTO" ? "abierto" : "cerrado";

    estado.textContent = "En vivo";
  } catch (e) {
    estado.textContent = "Sin conexión";
  }
}

async function actualizarGraficaDesdeServidor() {
  try {
    const respuesta = await fetch("/api/historial/");
    if (!respuesta.ok) return;
    const datos = await respuesta.json();
    if (datos.grafica && datos.grafica.etiquetas.length) {
      actualizarGrafica(datos.grafica);
    }
  } catch (e) {
    // Si falla, la gráfica conserva los últimos datos
  }
}

// Datos iniciales que Django incluyó en la página
const datosIniciales = JSON.parse(document.getElementById("datos-grafica").textContent);
crearGrafica(datosIniciales);

setInterval(actualizarTarjetas, INTERVALO_TARJETAS_MS);
setInterval(actualizarGraficaDesdeServidor, INTERVALO_GRAFICA_MS);
