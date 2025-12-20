import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, tuitionAPI } from '../../api';

const Tuition = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [tuitions, setTuitions] = useState([]);
  const [selectedTuition, setSelectedTuition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const studentRes = await studentsAPI.getStudentByUserId(user._id);
      setStudent(studentRes.data);

      const tuitionsRes = await tuitionAPI.getStudentTuitions(studentRes.data._id);
      setTuitions(tuitionsRes.data);

      if (tuitionsRes.data.length > 0) {
        setSelectedTuition(tuitionsRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tuition & Billing</h1>
        <p className="text-gray-600">View your tuition fees and payment history</p>
      </div>

      {/* Tuition History */}
      {tuitions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Select Period</h2>
          <select
            value={selectedTuition?._id || ''}
            onChange={(e) => {
              const tuition = tuitions.find((t) => t._id === e.target.value);
              setSelectedTuition(tuition);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {tuitions.map((tuition) => (
              <option key={tuition._id} value={tuition._id}>
                {tuition.schoolYear} - {tuition.semester} Semester
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedTuition ? (
        <>
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                ₱{selectedTuition.totalAmount.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Discount</div>
              <div className="text-2xl font-bold text-green-600">
                ₱{selectedTuition.discount.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Amount Due</div>
              <div className="text-2xl font-bold text-blue-600">
                ₱{selectedTuition.netAmount.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Balance</div>
              <div className="text-2xl font-bold text-red-600">
                ₱{selectedTuition.balance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Payment Plan */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Payment Plan</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTuition.paymentPlan === 'Set A'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {selectedTuition.paymentPlan}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {selectedTuition.paymentPlan === 'Set A'
                ? 'Full Payment (with 5% discount)'
                : '4 Installments'}
            </p>
          </div>

          {/* Tuition Breakdown */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Tuition Breakdown</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedTuition.breakdown.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        ₱{item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Installments (for Set B) */}
          {selectedTuition.paymentPlan === 'Set B' && selectedTuition.installments.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Installment Schedule</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {selectedTuition.installments.map((installment, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        installment.isPaid
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            Installment {installment.installmentNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            Due: {new Date(installment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ₱{installment.amount.toLocaleString()}
                          </div>
                          <div
                            className={`text-sm ${
                              installment.isPaid ? 'text-green-600' : 'text-orange-600'
                            }`}
                          >
                            {installment.isPaid ? 'Paid' : 'Unpaid'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment History */}
          {selectedTuition.payments.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Payment History</h2>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Reference
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedTuition.payments.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {payment.paymentMethod}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {payment.referenceNumber || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ₱{payment.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No tuition records found</p>
        </div>
      )}
    </div>
  );
};

export default Tuition;
