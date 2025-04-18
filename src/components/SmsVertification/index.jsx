import { useEffect, useState } from 'react';
import { Input, notification } from 'antd';
import '../CardData/ObunaPay.css';
import logo from '../../assets/hisobchi.svg';
import atmos from '../../assets/atmos.svg';
import left from '../../assets/Left Icon.svg';
import { NavLink } from 'react-router-dom';

const ConfirmationCode = () => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    if (timeLeft === 0) {
      setShowResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const resendCode = async () => {
    const MainButton = window.Telegram.WebApp.MainButton;

    MainButton.showProgress();
    MainButton.disable();

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
            card_number: localStorage.getItem('cardNumber'),
            expiry: localStorage.getItem('expiryDate'),
          }),
        }
      );

      const data = await response.json();

      if (data.status == 400) {
        // notification.error({
        //   message: 'Xatolik',
        //   description: 'Iltimos, nomerga ulangan kartani kiriting!',
        // });
        console.log(data);
      } else if (data.status == 200) {
        localStorage.setItem('transaction_id', data.transaction_id);
        localStorage.setItem('phone', data.phone);
        navigate('/sms-verification');
      } else if (data.description == 'У партнера имеется указанная карта') {
        notification.error({
          message: 'Xatolik',
          description: "Bu karta oldin qo'shilgan boshqa karta kiriting!",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // notification.error({
      //   message: 'Xatolik',
      //   description: 'Iltimos, boshqa karta kiriting!',
      // });
    } finally {
      MainButton.hideProgress();
      MainButton.enable();
    }
    setTimeLeft(120);
    setShowResend(false);
  };

  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: type,
      description: message,
    });
  };

  const handleConfirm = async (code) => {
    try {
      const response = await fetch(
        'https://xisobchiai2.admob.uz/api/v1/opt/' +
          localStorage.getItem('obunaPay'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            transaction_id: localStorage.getItem('transaction_id'),
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        window.Telegram.WebApp.close();
      } else {
        openNotificationWithIcon('error', 'Boshqa kartani kiriting!');
      }
    } catch (error) {
      console.log(error);
      openNotificationWithIcon(
        'error',
        "Xatolik yuz berdi, qayta urinib ko'ring!"
      );
    }
  };

  const validateCode = (code) => {
    return code && code.length === 6;
  };

  useEffect(() => {
    if (window.Telegram) {
      const MainButton = window.Telegram.WebApp.MainButton;

      MainButton.setText('Tasdiqlash').show();

      const onClickHandler = () => {
        if (validateCode(code)) {
          handleConfirm(code);
        } else {
          notification.error({
            message: 'Xatolik',
            description:
              'Iltimos telefon raqamingizga borgan 6 xonali kodni kiriting!',
          });
        }
      };

      MainButton.onClick(onClickHandler);

      return () => {
        MainButton.offClick(onClickHandler);
        MainButton.hide();
      };
    }
  }, [code]);

  return (
    <div className="container">
      <div className="padding sms">
        <NavLink to={`/` + localStorage.getItem('obunaPay')}>
          <img src={left} alt="left" />
          <span>Ortga</span>
        </NavLink>
        <h1 style={{ textAlign: 'center', margin: 0 }} className="title ">
          Tasdiqlash kodi
        </h1>
      </div>

      <form>
        <Input.OTP
          className="custom-otp-input"
          formatter={(str) => str.toUpperCase()}
          value={code}
          onChange={(val) => setCode(val)}
        />
      </form>

      {!showResend ? (
        <button className="button">{formatTime(timeLeft)}</button>
      ) : (
        <button onClick={resendCode} className="button">
          Qayta kodni olish
        </button>
      )}

      <div className="images">
        <img className="logo" src={logo} alt="logo" width={80} height={80} />
        <img src={atmos} alt="atmos" width={80} height={80} />
      </div>

      <p className="help">Qo’llab-quvvatlovchilar kompaniyalar</p>

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
    </div>
  );
};

export default ConfirmationCode;
