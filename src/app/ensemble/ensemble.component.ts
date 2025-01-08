import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-ensemble',
  standalone: false,
  
  templateUrl: './ensemble.component.html',
  styleUrl: './ensemble.component.css'
})
export class EnsembleComponent implements AfterViewInit {
  topsisForm: FormGroup;
  result: any[] = [];
  chart: any;
  selectedPreferenceFunction: string = 't1'; // Default to 't1' (Usual)
  criteriaDisplay: { [key: string]: string } = {
    "prihodki": "Prihodki",
    "odstotek_spremembe_prihodkov": "Odstotek spremembe prihodkov",
    "cisti_dobicek": "Čisti dobiček",
    "rast_prihodkov": "Rast prihodkov",
    "sredstva": "Sredstva",
    "debt_to_equity_ratio": "Razmerje med dolgom in kapitalom",
    "roi": "Donosnost naložbe"
  };

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private fb: FormBuilder, private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.topsisForm = this.fb.group({
      prihodki: [0.4, [Validators.required, Validators.min(0), Validators.max(1)]],
      odstotek_spremembe_prihodkov: [0.1, [Validators.required, Validators.min(0), Validators.max(1)]],
      cisti_dobicek: [0.2, [Validators.required, Validators.min(0), Validators.max(1)]],
      rast_prihodkov: [0.1, [Validators.required, Validators.min(0), Validators.max(1)]],
      sredstva: [0.1, [Validators.required, Validators.min(0), Validators.max(1)]],
      debt_to_equity_ratio: [0.05, [Validators.required, Validators.min(0), Validators.max(1)]],
      roi: [0.05, [Validators.required, Validators.min(0), Validators.max(1)]],
    });
  }

  ngAfterViewInit(): void {
    // Wait until view is initialized
    this.createChart();
  }

  onSubmit() {
    const criteria = {
      "preference_function": this.selectedPreferenceFunction,
      "weights": 
        {
        prihodki: this.topsisForm.get('prihodki')?.value,
        odstotek_spremembe_prihodkov: this.topsisForm.get('odstotek_spremembe_prihodkov')?.value,
        cisti_dobicek: this.topsisForm.get('cisti_dobicek')?.value,
        rast_prihodkov: this.topsisForm.get('rast_prihodkov')?.value,
        sredstva: this.topsisForm.get('sredstva')?.value,
        debt_to_equity_ratio: this.topsisForm.get('debt_to_equity_ratio')?.value,
        roi: this.topsisForm.get('roi')?.value
        }
    };
    console.log('criteria', criteria);
    if (this.topsisForm.valid) {
      this.http.post('http://127.0.0.1:5000/ensemble', criteria)
        .subscribe(response => {
          this.result = response as any[];
          console.log(this.result);
          this.cdr.detectChanges();
          this.createChart();  // Create the chart after receiving the response
        });
    } else {
      console.log('Form is not valid');
    }
  }

  createChart() {
    console.log('creating graph');
    if (!this.chartCanvas) return;  // Ensure the canvas element is available

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for the canvas');
      return;
    }

    // Destroy any existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    // Prepare chart data from the result
    const names = this.result.map(item => item.name);
    const ahpRanks = this.result.map(item => item.ahp_rank);
    const topsisRanks = this.result.map(item => item.topsis_rank);
    const prometheeRanks = this.result.map(item => item.promethee_rank);
    const waspasRanks = this.result.map(item => item.waspas_rank);

    // Create the chart with stacked bars
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [
          {
            label: 'AHP Rank',
            data: ahpRanks,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            stack: 'stack0'
          },
          {
            label: 'Topsis Rank',
            data: topsisRanks,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            stack: 'stack0'
          },
          {
            label: 'Promethee Rank',
            data: prometheeRanks,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            stack: 'stack0'
          },
          {
            label: 'Waspas Rank',
            data: waspasRanks,
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            stack: 'stack0'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: Rank ${context.raw}`;
              }
            }
          }
        }
      }
    });
  }

  updatePreferenceFunction(functionType: string): void {
    this.selectedPreferenceFunction = functionType;
    console.log('Selected Preference Function:', this.selectedPreferenceFunction);
  }
}