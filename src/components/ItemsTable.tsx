import React, { useState, useEffect, useRef } from 'react';
import { DataTable, DataTablePageParams } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import axios from 'axios';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface Item {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string | null;
    date_start: number | null;
    date_end: number | null;
}

const ItemsTable: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]); 
    const [selectedRows, setSelectedRows] = useState<Item[]>([]); 
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [rowCount, setRowCount] = useState<number | null>(null); 
    const [pageData, setPageData] = useState<{ [key: number]: Item[] }>({}); 
    const overlayPanelRef = useRef<OverlayPanel>(null);

    
    const fetchItems = async (page: number): Promise<Item[]> => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
            const data = response.data.data;
            const total = response.data.pagination.total;
            setTotalRecords(total);
            setPageData((prevState) => ({ ...prevState, [page]: data })); 
            return data;
        } catch (error) {
            console.error('Error fetching items:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    
    useEffect(() => {
        fetchItems(page).then((data) => setItems(data));
    }, [page]);

    
    const onPageChange = (event: DataTablePageParams): void => {
        setPage(event.page + 1); 
    };

    
    const handleRowSelectionChange = (e: { value: Item[] }): void => {
        setSelectedRows(e.value); 
    };

    
    const handleSelectRows = async (): Promise<void> => {
        if (rowCount && rowCount > 0) {
            const rowsToSelect: Item[] = [];
            let remainingCount = rowCount;

            
            for (let i = page; remainingCount > 0; i++) {
                const currentPageData = pageData[i] || (await fetchItems(i));
                const rowsToAdd = currentPageData.slice(0, remainingCount);
                rowsToSelect.push(...rowsToAdd);
                remainingCount = rowsToAdd.length;

                
                if (currentPageData.length < remainingCount) break;
            }

            setSelectedRows(rowsToSelect);
        }
        overlayPanelRef.current?.hide(); 
    };

    
    const renderTitleHeader = (): JSX.Element => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i
                className="pi pi-chevron-down"
                style={{ cursor: 'pointer', fontSize: '1.2rem', opacity: 0.7 }}
                onClick={(e) => overlayPanelRef.current?.toggle(e)}
            ></i>
            <span>Title</span>

            
            <OverlayPanel ref={overlayPanelRef} style={{ padding: '1rem', minWidth: '250px', zIndex: 1000 }}>
                <h4>Select Rows</h4>
                <p style={{ marginBottom: '1rem' }}>Enter the number of rows you want to select:</p>
                <InputNumber
                    value={rowCount}
                    onValueChange={(e) => setRowCount(e.value || 0)}
                    min={1}
                    max={totalRecords}
                    placeholder="Enter a number"
                    style={{ width: '100%' }}
                />
                <Button
                    label="Select Rows"
                    icon="pi pi-check"
                    onClick={handleSelectRows}
                    className="mt-2"
                    disabled={!rowCount || rowCount < 1 || rowCount > totalRecords}
                />
            </OverlayPanel>
        </div>
    );

    return (
        <div>
            <DataTable
                value={items}
                paginator
                lazy
                loading={loading}
                rows={10}
                totalRecords={totalRecords}
                onPage={onPageChange}
                selection={selectedRows}
                onSelectionChange={handleRowSelectionChange}
                selectionMode="multiple" 
                dataKey="id" 
            >

                <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                <Column header={renderTitleHeader()} field="title" sortable></Column>
                <Column field="place_of_origin" header="Place of Origin" sortable></Column>
                <Column field="artist_display" header="Artist"></Column>
                <Column field="inscriptions" header="Inscriptions"></Column>
                <Column field="date_start" header="Start Date"></Column>
                <Column field="date_end" header="End Date"></Column>
            </DataTable>
        </div>
    );
};

export default ItemsTable;
