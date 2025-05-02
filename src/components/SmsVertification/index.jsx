import { useEffect, useRef, useState } from 'react';
import {  message, notification } from 'antd';
import '../CardData/ObunaPay.css';
import logo from '../../assets/hisobchi.svg';
import atmos from '../../assets/atmos.svg';
import left from '../../assets/Left Icon.svg';
import { NavLink } from 'react-router-dom';

const CustomOTPInput = ({ length = 6, onChange }) => {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) return;

    e.target.value = value[0];
    moveToNext(index);
    triggerCombinedValue();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      moveToPrevious(index);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    paste.split('').forEach((char, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = char;
      }
    });
    triggerCombinedValue();
    const nextIndex = paste.length < length ? paste.length : length - 1;
    inputsRef.current[nextIndex]?.focus();
  };

  const moveToNext = (index) => {
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const moveToPrevious = (index) => {
    if (index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const triggerCombinedValue = () => {
    const code = inputsRef.current.map((input) => input.value).join('');
    onChange(code);
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="custom-otp-wrapper">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          ref={(el) => (inputsRef.current[index] = el)}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          style={{
            width: '48px',
            height: '48px',
            textAlign: 'center',
            fontSize: '16px',
            color: '#171717',
            borderRadius: '12px',
            border: '0.5px solid #C5C6CC',
            outline: 'none',
            margin: '0 5px',
            padding: '5px'
          }}
        />
      ))}
    </div>
  );
};


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
        message.error('Iltimos, nomerga ulangan kartani kiriting!');
      } else if (data.status == 200) {
        localStorage.setItem('transaction_id', data.transaction_id);
        localStorage.setItem('phone', data.phone);
      } else if (data.description == 'У партнера имеется указанная карта') {
        message.error("Bu karta oldin qo'shilgan boshqa karta kiriting!");
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      MainButton.hideProgress();
      MainButton.enable();
    }

    setTimeLeft(120);
    setShowResend(false);
  };

  const openNotificationWithIcon = (type, messageText) => {
    notification[type]({
      message: type,
      description: messageText,
    });
  };

  const handleConfirm = async (code) => {

    const MainButton = window.Telegram.WebApp.MainButton;
    MainButton.showProgress();
    MainButton.disable();
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
    } finally {
      MainButton.hideProgress();
      MainButton.enable();
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
          message.error(
            'Iltimos telefon raqamingizga borgan 6 xonali kodni kiriting!'
          );
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
        <CustomOTPInput onChange={setCode} />
      </form>

      {!showResend ? (
        <button className="button">{formatTime(timeLeft)}</button>
      ) : (
        <button onClick={resendCode} className="button">
          Qayta kodni olish
        </button>
      )}

      <div className="images">
        <img className="logo transparent" src={logo} alt="logo" width={80} height={80} />
        <img className="transparent" src={atmos} alt="atmos" width={80} height={80} />
      </div>

      <p className="help transparent">
        To'lov operatori:{' '}
        <a href="https://atmos.uz" target="_blank" rel="noopener noreferrer">
          Atmos.uz
        </a>{' '}
        to'lov tizimi
      </p>

      <h2>Eslatmalar</h2>
      <p>- To'lov UzCard va Humo kartalari orqali amalga oshiriladi.</p>

      <p className="medium">
        - Karta ma'lumotlari Atmos to'lov tizimida xavfsiz saqlanadi. To'lovlar haqqoniyligi kafolatlanadi.{' '}
        <a href="https://atmos.uz/documents" target="_blank" rel="noopener noreferrer">
          Oferta
        </a>
      </p>
      <p>
        - Yillik tarif harid qilinganda, karta ma'lumotlarini kiritish talab etilmaydi.
      </p>
    </div>
  );
};

export default ConfirmationCode;
