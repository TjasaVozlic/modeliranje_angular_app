import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-data',
  standalone: false,
  
  templateUrl: './data.component.html',
  styleUrl: './data.component.css'
})
export class DataComponent implements OnInit {
  displayedColumns: string[] = [
    'Rank',
    'Name',
    'prihodki',
    'odstotek_spremembe_prihodkov',
    'cisti_dobicek',
    'rast_prihodkov',
    'sredstva',
    'debt_to_equity_ratio',
    'roi'
  ];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }
  

  fetchData() {
    this.http.get<any>('http://127.0.0.1:5000/data').subscribe(
      (response) => {
        this.dataSource = response.data_matrix;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
}
