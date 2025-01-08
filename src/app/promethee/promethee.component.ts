import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-promethee',
  standalone: false,
  
  templateUrl: './promethee.component.html',
  styleUrl: './promethee.component.css'
})
export class PrometheeComponent implements AfterViewInit {
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
      this.http.post('http://127.0.0.1:5000/promethee', criteria)
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

    // Prepare chart data
    const names = this.result.map(item => item.name);
    const closeness = this.result.map(item => item.relative_closeness);
    const ranks = this.result.map(item => item.rank);

    // Create the chart
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [{
          label: 'Relative Closeness',
          data: closeness,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Rank: ${ranks[context.dataIndex]}, Closeness: ${context.raw}`;
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