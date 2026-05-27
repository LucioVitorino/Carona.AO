import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-alert-message',
  standalone: true,
  imports: [NgIf],
  templateUrl: './alert-message.component.html',
  styleUrl: './alert-message.component.scss',
})
export class AlertMessageComponent {
  @Input() type: 'error' | 'success' | 'info' = 'info';
  @Input() title = '';
  @Input() message = '';
}