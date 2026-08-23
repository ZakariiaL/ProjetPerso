import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { isBrowser } from '../../utils/platform';

type ContactChannel = 'whatsapp' | 'phone' | 'instagram';

interface ContactForm {
  name: string;
  phone: string;
  subject: string;
  message: string;
  channel: ContactChannel;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  readonly whatsappPhone = '212600000000';

  form: ContactForm = {
    name: '',
    phone: '',
    subject: 'Conseil parfum',
    message: '',
    channel: 'whatsapp'
  };

  submitted = false;

  readonly subjects = [
    'Conseil parfum',
    'Disponibilité produit',
    'Commande WhatsApp',
    'Livraison',
    'Service après-vente',
    'Collaboration'
  ];

  readonly contactCards = [
    {
      icon: 'support_agent',
      title: 'Conseil personnalisé',
      text: 'On t’aide à choisir une fragrance selon ton style, l’occasion et la tenue souhaitée.'
    },
    {
      icon: 'local_shipping',
      title: 'Livraison Maroc',
      text: 'Livraison express entre 24 et 48 heures selon la ville.'
    },
    {
      icon: 'verified',
      title: 'Commande confirmée',
      text: 'Chaque demande est relue avant validation pour éviter toute erreur.'
    }
  ];

  get canSubmit(): boolean {
    return !!(
      this.form.name.trim()
      && this.form.phone.trim()
      && this.form.subject.trim()
      && this.form.message.trim()
    );
  }

  get whatsappUrl(): string {
    return `https://wa.me/${this.whatsappPhone}?text=${encodeURIComponent(this.buildMessage())}`;
  }

  sendMessage(): void {
    this.submitted = true;

    if (!this.canSubmit) {
      return;
    }

    if (isBrowser()) {
      window.open(this.whatsappUrl, '_blank', 'noopener');
    }
  }

  resetForm(): void {
    this.form = {
      name: '',
      phone: '',
      subject: 'Conseil parfum',
      message: '',
      channel: 'whatsapp'
    };
    this.submitted = false;
  }

  private buildMessage(): string {
    return [
      'Bonjour Moustaparfum,',
      '',
      `Nom : ${this.form.name.trim() || '-'}`,
      `Téléphone : ${this.form.phone.trim() || '-'}`,
      `Sujet : ${this.form.subject}`,
      `Canal préféré : ${this.getChannelLabel(this.form.channel)}`,
      '',
      'Message :',
      this.form.message.trim() || '-'
    ].join('\n');
  }

  private getChannelLabel(channel: ContactChannel): string {
    const labels: Record<ContactChannel, string> = {
      whatsapp: 'WhatsApp',
      phone: 'Appel téléphonique',
      instagram: 'Instagram'
    };

    return labels[channel];
  }
}
