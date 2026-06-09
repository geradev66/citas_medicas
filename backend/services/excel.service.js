import ExcelJS from "exceljs"

export const exportMedicosToExcel = async (medicos) => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Médicos")

  sheet.columns = [
    { header: "Nombre", key: "name", width: 20 },
    { header: "Apellido", key: "lastName", width: 20 },
    { header: "Género", key: "gender", width: 10 },
    { header: "Email", key: "email", width: 30 },
    { header: "Fecha de Nacimiento", key: "birthDate", width: 18 },
    { header: "Especialidad", key: "especialidad", width: 25 },
    { header: "Estado", key: "status", width: 12 },
  ]

  sheet.getRow(1).font = { bold: true }

  medicos.forEach((medico) => {
    sheet.addRow({
      name: medico.name,
      lastName: medico.lastName,
      gender: medico.gender,
      email: medico.email,
      birthDate: medico.birthDate
        ? new Date(medico.birthDate).toLocaleDateString("es-ES")
        : "",
      especialidad: medico.especialidad?.name || "",
      status: medico.status ? "Activo" : "Inactivo",
    })
  })

  return workbook
}
