import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0f172a',
    color: '#f8fafc',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  private GameAlert = Swal.mixin({
    background: '#020617',
    color: '#f8fafc',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#1e293b',
    customClass: {
      popup: 'border border-white/10 rounded-[2rem] backdrop-blur-3xl',
      title: 'text-2xl font-black italic uppercase tracking-tighter',
      confirmButton: 'px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-105',
      cancelButton: 'px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-105'
    }
  });

  /**
   * Show a quick toast notification
   */
  toast(icon: SweetAlertIcon, title: string) {
    this.Toast.fire({
      icon,
      title,
      customClass: {
        popup: 'border-l-4 ' + this.getIconBorderClass(icon)
      }
    });
  }

  /**
   * Success toast shorthand
   */
  success(message: string) {
    this.toast('success', message);
  }

  /**
   * Error toast shorthand
   */
  error(message: string) {
    this.toast('error', message);
  }

  /**
   * Info toast shorthand
   */
  info(message: string) {
    this.toast('info', message);
  }

  /**
   * Warning toast shorthand
   */
  warn(message: string) {
    this.toast('warning', message);
  }

  /**
   * Show a full modal alert
   */
  async alert(icon: SweetAlertIcon, title: string, text: string) {
    return this.GameAlert.fire({
      icon,
      title,
      text
    });
  }

  /**
   * Special reveal alert with 10s timer for game results
   */
  async revealAlert(title: string, text: string, icon: SweetAlertIcon = 'info') {
    return this.GameAlert.fire({
      title,
      html: `<div class="p-4"><p class="text-white/60 mb-4">${text}</p><div class="text-[10px] font-black text-blue-400 animate-pulse tracking-widest">NEXT ROUND STARTING SOON...</div></div>`,
      icon,
      timer: 10000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false
    });
  }

  /**
   * Show a confirmation modal
   */
  async confirm(title: string, text: string, confirmButtonText = 'PROCEED', icon: SweetAlertIcon = 'question') {
    const result = await this.GameAlert.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'CANCEL'
    });
    return result.isConfirmed;
  }

  private getIconBorderClass(icon: SweetAlertIcon): string {
    switch (icon) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'warning': return 'border-yellow-500';
      case 'info': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  }
}
