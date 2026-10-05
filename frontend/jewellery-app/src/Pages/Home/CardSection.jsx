import React from 'react'
import {
  FaUsers,
  FaListAlt,
  FaBalanceScale,
  FaWallet,
  FaFileInvoiceDollar,
} from 'react-icons/fa'
import Card from '../../Components/Card/Card'

const cards = [
  { title: 'Customer Details', icon: <FaUsers />, route: '/customerDetails' },
  { title: 'Credit List', icon: <FaListAlt />, route: '/creditList' },
  { title: 'Creditlist 0 Balance', icon: <FaBalanceScale />, route: '/creditlistZeroBalance' },
  { title: 'Expenses / Income', icon: <FaWallet />, route: '/expensesDetails' },
  { title: 'Billing', icon: <FaFileInvoiceDollar />, route: '/billing' },
  { title: 'Credit 25K', icon: <FaBalanceScale />, route: '/creditList25K' },
]

const CardSection = () => {
  return (
    <div className="container-fluid px-3 px-sm-4 px-lg-5 py-4">
      <div className="row g-3 g-md-4">
        {cards.map((card, index) => (
          <div className="col-12 col-sm-6 col-lg-4" key={index}>
            <Card title={card.title} icon={card.icon} route={card.route} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CardSection