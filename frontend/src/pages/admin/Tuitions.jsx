import { useState, useEffect } from 'react';
import { tuitionAPI, studentsAPI } from '../../api';
import { DollarSign, Search, Filter, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Tuitions = () => {
  const [tuitions, setTuitions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'Cash',
    referenceNumber: '',
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { limit: 1000 }; // Fetch all tuitions
      if (statusFilter !== 'all') params.status = statusFilter;

      const [tuitionRes, studentsRes] = await Promise.all([
        tuitionAPI.getTuitions(params),
        studentsAPI.getStudents({ limit: 1000 }), // Fetch all students
      ]);

      setTuitions(tuitionRes.data.tuitions || tuitionRes.data || []);
      setStudents(studentsRes.data.students || studentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tuition records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = (tuition) => {
    setSelectedTuition(tuition);
    setPaymentData({
      amount: '',
      paymentMethod: 'Cash',
      referenceNumber: '',
      remarks: '',
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (parseFloat(paymentData.amount) > selectedTuition.balance) {
      toast.error('Payment amount cannot exceed the balance');
      return;
    }

    try {
      await tuitionAPI.addPayment(selectedTuition._id, {
        ...paymentData,
        amount: parseFloat(paymentData.amount),
      });

      toast.success('Payment added successfully');
      setShowPaymentModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error(error.response?.data?.message || 'Failed to add payment');
    }
  };

  const filteredTuitions = tuitions.filter((tuition) => {
    const studentName = `${tuition.student?.user?.firstName || ''} ${tuition.student?.user?.lastName || ''}`.toLowerCase();
    const studentNumber = tuition.student?.studentNumber?.toLowerCase() || '';
    return studentName.includes(searchTerm.toLowerCase()) || studentNumber.includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid':
        return 'bg-red-100 text-red-800';
      case 'Overdue':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'Partial':
        return <Clock className="w-4 h-4" />;
      case 'Unpaid':
      case 'Overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tuition Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage student tuition fees and payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tuition Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading tuition records...</div>
        </div>
      ) : filteredTuitions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No tuition records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTuitions.map((tuition) => (
            <div key={tuition._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {tuition.student?.user?.firstName?.[0]}{tuition.student?.user?.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tuition.student?.user?.firstName} {tuition.student?.user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tuition.student?.studentNumber} • {tuition.student?.program}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">School Year</div>
                        <div className="text-sm font-medium text-gray-900">{tuition.schoolYear}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Semester</div>
                        <div className="text-sm font-medium text-gray-900">{tuition.semester}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Payment Plan</div>
                        <div className="text-sm font-medium text-gray-900">
                          {tuition.paymentPlan === 'Set A' ? 'Full Payment' : 'Installment'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Due Date</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(tuition.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Total Amount</div>
                          <div className="font-semibold text-gray-900">₱{tuition.totalAmount?.toLocaleString()}</div>
                        </div>
                        {tuition.discount > 0 && (
                          <div>
                            <div className="text-gray-600">Discount</div>
                            <div className="font-semibold text-green-600">-₱{tuition.discount?.toLocaleString()}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-gray-600">Net Amount</div>
                          <div className="font-semibold text-gray-900">₱{tuition.netAmount?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Total Paid</div>
                          <div className="font-semibold text-blue-600">₱{tuition.totalPaid?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Balance</div>
                          <div className="font-semibold text-red-600">₱{tuition.balance?.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Payments */}
                    {tuition.payments?.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-medium text-gray-700 mb-2">Recent Payments:</div>
                        <div className="space-y-2">
                          {tuition.payments.slice(-3).map((payment, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
                              <div>
                                <span className="font-medium">₱{payment.amount?.toLocaleString()}</span>
                                <span className="text-gray-600 ml-2">• {payment.paymentMethod}</span>
                                {payment.referenceNumber && (
                                  <span className="text-gray-500 ml-2">• Ref: {payment.referenceNumber}</span>
                                )}
                              </div>
                              <span className="text-gray-500">
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status and Actions */}
                  <div className="ml-6 flex flex-col items-end space-y-3">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(tuition.status)}`}>
                      {getStatusIcon(tuition.status)}
                      <span>{tuition.status}</span>
                    </span>

                    {tuition.status !== 'Paid' && (
                      <button
                        onClick={() => handleAddPayment(tuition)}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Add Payment</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedTuition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Payment</h2>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Student</div>
              <div className="font-semibold text-gray-900">
                {selectedTuition.student?.user?.firstName} {selectedTuition.student?.user?.lastName}
              </div>
              <div className="text-sm text-gray-600 mt-2">Remaining Balance</div>
              <div className="text-2xl font-bold text-red-600">₱{selectedTuition.balance?.toLocaleString()}</div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Online">Online Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={paymentData.remarks}
                  onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Optional"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tuitions;
