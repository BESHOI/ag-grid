import { useState, useMemo, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AgGridReact } from 'ag-grid-react'
import { IoClose, IoCopy } from 'react-icons/io5'
import clsx from 'clsx'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.min.css'
import './App.css'

function App() {
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  const gridRef = useRef()
  const initData = [
    { id: 1, firstName: 'Terry', lastName: 'Medhurst', gender: 'male' },
    { id: 2, firstName: 'Sheldon', lastName: 'Quigley', gender: 'male' },
    { id: 3, firstName: 'Terrill', lastName: 'Hills', gender: 'male' },
    { id: 4, firstName: 'Miles', lastName: 'Cummerata', gender: 'male' },
    { id: 5, firstName: 'Mavis', lastName: 'Schultz', gender: 'male' },
    { id: 6, firstName: 'Alison', lastName: 'Reichert', gender: 'female' },
    { id: 7, firstName: 'Oleta', lastName: 'Abbott', gender: 'female' },
  ]
  const randNum = Math.floor(Math.random() * 100) + 1
  let [number, setNumber] = useState(randNum)

  const fetcher = async (url) => await (await fetch(url)).json()

  let { data: users, isError } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      fetcher('https://dummyjson.com/users?limit=7&select=id,firstName,lastName,gender'),
    keepPreviousData: true,
    initialData: initData,
  })
  const userData = users?.users

  let { data: user } = useQuery({
    queryKey: ['user', number],
    queryFn: () =>
      fetcher(`https://dummyjson.com/users/${number}?select=id,firstName,lastName,gender`),
    enabled: !!users,
  })

  const [rowData, setRowData] = useState(userData ? userData : initData)
  const [columnDefs] = useState([
    {
      field: 'id',
      checkboxSelection: true,
      sortable: true,
    },
    { field: 'firstName', headerName: 'name' },
    { field: 'lastName', headerName: 'last_name' },
    { field: 'gender', headerName: 'status' },
    {
      headerName: 'actions',
      cellRenderer: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          {p.value}
          <IoCopy fill="white" onClick={handleDuplicate} />
          <IoClose fill="white" onClick={handleDelete} />
        </div>
      ),
    },
  ])

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
    }),
    []
  )

  const gridOptions = {
    rowData: rowData,
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    animateRows: true,
    enableCellChangeFlash: true,
    getRowHeight: (params) => 35,
  }

  const handleDelete = useCallback(() => {
    const row = gridRef.current.api.getSelectedRows()
    gridRef.current.api.applyTransaction({ remove: row })
  }, [])

  const handleDuplicate = useCallback(() => {
    const row = gridRef.current.api.getSelectedRows()
    const newRows = row.map((item) => ({ ...item, id: item.id + 1 }))
    gridRef.current.api.applyTransaction({ add: newRows })
  }, [])

  const handleRandomBtn = useCallback(() => {
    const newRand = () => randNum
    newRand !== number ? setNumber(newRand) : null
    gridRef.current.api.applyTransaction({ add: [user] })
  }, [randNum])

  return (
    <div className="App" style={{ width: '100%', height: '100%' }}>
      {isError && <p>error...</p>}
      <div style={{ display: 'flex', gap: '1rem', margin: '.5rem 0', placeContent: 'center' }}>
        <button onClick={handleRandomBtn}>random</button>
        <button onClick={handleDelete}>delete</button>
      </div>
      <div
        className={clsx(darkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine')}
        style={{ width: '100%', height: '100%' }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
        />
      </div>
    </div>
  )
}

export default App
