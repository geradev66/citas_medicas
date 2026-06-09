import ExcelJs from "exceljs"

export const exportPacientesToExcel = async (pacientes) =>{
    const workbook = new ExcelJs.Workbook()
    const sheet = workbook.addWorksheet("Pacientes")

    sheet.columns = [
        { header: "Nombre", key: "name", width: 20 },
        { header: "Apellido", key: "lastName", width: 20 },
        { header: "Seguro", key: "insurance", width: 20 },
        { header: "Telefono", key: "phoneNumber", width: 20 },
        { header: "Género", key: "gender", width: 10 },

    ]


sheet.getRow(1).font = { bold: true }

pacientes.forEach((paciente) => {
    sheet.addRow({
        name: paciente.name,
        lastName: paciente.lastName,
        insurance: paciente.insurance,
        phoneNumber: paciente.phoneNumber,
        gender: paciente.gender,
    })
}) 

return workbook
}