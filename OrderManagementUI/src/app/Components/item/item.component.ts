import { Component, OnInit, ViewChild, viewChild } from '@angular/core';
import { Item } from '../../Models/item';
import { ItemService } from '../../Services/item.service';
import { Router } from '@angular/router';
import { response } from 'express';
import { MatTabGroup } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrl: './item.component.css',
})
export class ItemComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  items: Item[] = [];
  newItem: Item = { itemId: 0, name: '', unit: '', type: '' };
  editingItem: boolean[] = [];

  constructor(
    private itemService: ItemService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getItems();
  }

  getItems() {
    this.itemService.getItems().subscribe((items) => (this.items = items));
  }

  addItem(): void {
    this.itemService.postItem(this.newItem).subscribe({
      next: (item) => {
        console.log(item);
        this.newItem = { itemId: 0, name: '', unit: '', type: '' };
        this.getItems();
        this.tabGroup.selectedIndex = 1;
        this.showSnackbar('Item added successfully!');
      },
      error: (error) => {
        console.error('Error adding item', error);
        this.showSnackbar('Failed to add item.');
      },
    });
  }

  showSnackbar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  updateItem(index: number, item: Item) {
    this.itemService.updateItem(item.itemId, item).subscribe({
      next: (response) => {
        console.log(response);
        this.editingItem[index] = false;
        this.itemService.getItems().subscribe((x) => {
          this.items = x;
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  cancelEdit(index: number): void {
    this.editingItem[index] = false;
  }

  deleteItem(itemId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.itemService.deleteItem(itemId).subscribe(() => {
          console.log('Deleted');
          this.itemService.getItems().subscribe((x) => {
            this.items = x;
          });
        });
      }
    });
  }
}
