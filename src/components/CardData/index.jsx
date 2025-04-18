import { useEffect } from 'react';
import MaskedInput from 'react-text-mask';
import { message, notification } from 'antd';
import './ObunaPay.css';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../../assets/hisobchi.svg';
import atmos from '../../assets/atmos.svg';

const ObunaPay = () => {
  const { id } = useParams();
  localStorage.setItem('obunaPay', id);
  const navigate = useNavigate();

  const validateCardNumber = (value) => {
    return value && value.length === 16;
  };

  const validateExpiryDate = (value) => {
    return value && /^(0[1-9]|1[0-2])\/(\d{2})$/.test(value);
  };

  const validateForm = () => {
    const cardNumber = document
      .querySelector('.card-number')
      .value.replace(/[^0-9]/g, '');
    const expiryDate = document.querySelector('.card-expiry').value;

    const cardValid = validateCardNumber(cardNumber);
    const expiryValid = validateExpiryDate(expiryDate);

    if (!cardValid) {
      notification.error({
        message: 'Xatolik',
        description: "Karta raqamini to'g'ri kiriting!",
      });
    }

    if (!expiryValid) {
      notification.error({
        message: 'Xatolik',
        description:
          "Kartangizning amal qilish muddatini to'g'ri kiriting! (MM/YY formatida)",
      });
    }

    return cardValid && expiryValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    const MainButton = window.Telegram.WebApp.MainButton;

    MainButton.showProgress();
    MainButton.disable();

    const cardNumber = document
      .querySelector('.card-number')
      .value.replace(/[^0-9]/g, '');
    const expiryDate = document.querySelector('.card-expiry').value;
    localStorage.setItem('expiryDate', expiryDate);
    localStorage.setItem('cardNumber', cardNumber);
    try {
      const response = await fetch(
        'https://xisobchiai2.admob.uz/api/v1/add-card/' +
          localStorage.getItem('obunaPay'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            card_number: cardNumber,
            expiry: expiryDate,
          }),
        }
      );

      const data = await response.json();

      if (data.status == 400) {
        message.error('Iltimos, nomerga ulangan kartani kiriting!');
      } else if (data.status == 200) {
        localStorage.setItem('transaction_id', data.transaction_id);
        localStorage.setItem('phone', data.phone);
        navigate('/sms-verification');
      } else if (data.description == 'У партнера имеется указанная карта') {
        message.error("Bu karta oldin qo'shilgan boshqa karta kiriting!");
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Iltimos, boshqa karta kiriting!');
    } finally {
      MainButton.hideProgress();
      MainButton.enable();
    }
  };

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.MainButton.setText('Tasdiqlash').show().setAtribut;
      window.Telegram.WebApp.MainButton.onClick(() => {
        handleSubmit();
      });
    } else {
      console.log('Telegram WebApp SDK yuklanmagan');
    }

    return () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.MainButton.hide();
      }
    };
  }, []);

  return (
    <div className="container">
      <div className="form-section">
        <h1 className="title padding">
          Bank kartasi ma&apos;lumotlarini kiriting
        </h1>
        <form>
          <MaskedInput
            mask={[
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              ' ',
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              ' ',
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              ' ',
              /\d/,
              /\d/,
              /\d/,
              /\d/,
            ]}
            className="card-number"
            placeholder="0000 0000 0000 0000"
            required
          />
          <MaskedInput
            mask={[/\d/, /\d/, '/', /\d/, /\d/]}
            className="card-expiry"
            placeholder="MM/YY"
            required
          />
        </form>
      </div>
      <h2>Eslatmalar</h2>
      <p>
        - To&apos;lovlar faqatgina UzCard va Humo kartalari orqali amalga
        oshiriladi.
      </p>

      <p className="medium">
        - Xavfsizlik maqsadida sizning bank kartangiz ma&apos;lumotlari Atmos
        to'lov tizimida saqlanadi.
      </p>

      <p>
        - Yillik tarif harid qilinganda, karta ma'lumotlarini kiritish talab
        etilmaydi.
      </p>

      <div className="images">
        <img className="logo" src={logo} alt="logo" width={80} height={80} />
        <img src={atmos} alt="atmos" width={80} height={80} />
      </div>

      <p className="help">Qo’llab-quvvatlovchilar kompaniyalar</p>
    </div>
  );
};

export default ObunaPay;
