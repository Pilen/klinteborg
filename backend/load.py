import openpyxl

def load(path):
    wb = openpyxl.load_workbook(path)
    ws = wb.active
    rows = iter(ws.iter_rows())
    headers = [cell.value for cell in next(rows)]
    result = []
    for row in rows:
        if all(cell.value is None for cell in row):
            break
        data = [cell.value for cell in row]
        # while data[-1] is None
        # result.append({header: str(cell.value) for header, cell in zip(headers, row, strict=True)})
        result.append({header: cell.value for header, cell in zip(headers, row, strict=True)})
    return result
