import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, UserCircle } from 'lucide-react'

export default async function Dashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: employee } = await supabase.from('employees').select('full_name, role').eq('id', user.id).single()
  const { data: rooms } = await supabase.from('rooms').select('*, stays!inner(guests(full_name), current_checkout_at, payment_status)').eq('status', 'ACTIVE')

  const occupiedCount = rooms?.filter(r => r.status === 'OCCUPIED').length || 0
  const availableCount = rooms?.filter(r => r.status === 'AVAILABLE').length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">HOTELWEB</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{employee?.full_name}</p>
            <p className="text-xs text-gray-500">{employee?.role === 'MASTER_ADMIN' ? 'Manager' : 'Reception'}</p>
          </div>
          <UserCircle className="w-8 h-8 text-gray-400" />
          <form action="/auth/signout" method="post">
            <button type="submit" className="p-2 text-gray-500 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">OCCUPIED</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800">{occupiedCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">AVAILABLE</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800">{availableCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">CURRENT SHIFT</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800">Shift 1</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-800">ROOMS</h2></div>
          <ul className="divide-y divide-gray-100">
            {rooms?.map((room) => (
              <li key={room.id} className="px-6 py-3 flex justify-between items-center">
                <span className="font-medium text-gray-800">Room {room.room_number}</span>
                <span className="text-sm text-gray-600">
                  {room.status === 'OCCUPIED' ? `🟢 ${room.stays[0]?.guests?.full_name || 'Occupied'}` : '⚪ Available'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
