import { db } from '@/server/fake-db/apps/ecommerce'

export default defineEventHandler(event => {
  const orderId = getIntId(event, 'Order id is required to get order details')

  const id = Number(orderId)

  try {
    const order = db.orderData.find(e => e.order === id)

    if (order) {
      setResponseStatus(event, 200)

      return order
    }

    // Order not found
    setResponseStatus(event, 404)

    return { message: 'Order not found' }
  }
  catch (error) {
    setResponseStatus(event, 500)

    return { message: 'Internal server error' }
  }
})
