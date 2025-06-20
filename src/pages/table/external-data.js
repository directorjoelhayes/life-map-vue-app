export default function externalData(rows) {

    const clonedRows = [
        ...rows.map((row) => {
            return {
                id: row.id,
                price: row.price * 100
            }
        })
    ]

    //randomly change the price of a row
    setInterval(() => {
        clonedRows.forEach((row) => {
            const upOrDown = Math.random() > 0.5 ? 1 : -1
            const randomIndex = Math.floor(Math.random() * 40)
      
            row.price = row.price + upOrDown * randomIndex
        })
        
    }, 100)

    return {
        clonedRows,
        getUpdates() {
            return this.clonedRows
        }
    }
}