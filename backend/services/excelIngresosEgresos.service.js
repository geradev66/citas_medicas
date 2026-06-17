import ExcelJS from "exceljs"

const estadoLabels = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  conciliado: 'Conciliado',
}

const metodoPagoLabels = {
  tarjeta_credito: 'Tarjeta de crédito',
  debito: 'Débito',
  transferencia: 'Transferencia',
  seguro_medico: 'Seguro médico',
}

const formatEstado = (estado) => {
  if (estado === true) return estadoLabels.confirmado
  if (estado === false) return estadoLabels.pendiente
  return estadoLabels[estado] || estado || ''
}

export const exportIngresosEgresosToExcel = async (registros) => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Ingresos y Egresos")

  sheet.columns = [
    { header: "Tipo", key: "tipo", width: 12 },
    { header: "Fecha", key: "fecha", width: 14 },
    { header: "Área", key: "area", width: 20 },
    { header: "Monto", key: "monto", width: 16 },
    { header: "Descripción", key: "descripcion", width: 35 },
    { header: "Proveedor", key: "proveedor", width: 25 },
    { header: "Paciente", key: "paciente", width: 25 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Método de pago", key: "metodoPago", width: 20 },
    { header: "Notas", key: "notas", width: 30 },
  ]

  sheet.getRow(1).font = { bold: true }

  registros.forEach((r) => {
    sheet.addRow({
      tipo: r.tipoTransaccion === 'ingreso' ? 'Ingreso' : 'Egreso',
      fecha: r.fecha ? new Date(r.fecha).toLocaleDateString("es-ES") : "",
      area: r.areaInfo?.name || (r.areas?.name) || "",
      monto: Number(r.monto),
      descripcion: r.descripcion || "",
      proveedor: r.proveedor || "",
      paciente: r.pacienteInfo
        ? `${r.pacienteInfo.name} ${r.pacienteInfo.lastName || ''}`
        : (r.pacientes?.name ? `${r.pacientes.name} ${r.pacientes.lastName || ''}` : ""),
      estado: formatEstado(r.estado),
      metodoPago: metodoPagoLabels[r.metodoPago] || r.metodoPago || "",
      notas: r.notasAdicionales || "",
    })
  })

  return workbook
}
