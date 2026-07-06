import argparse
import sys
from datetime import datetime, timedelta

def main():
    parser = argparse.ArgumentParser(description='Draft a simple service contract.')
    parser.add_argument('--client_name', required=True, help='Client name')
    parser.add_argument('--contractor_name', required=True, help='Contractor name')
    parser.add_argument('--scope', required=True, help='Scope of work')
    parser.add_argument('--payment_amount', type=float, required=True, help='Payment amount in USD')
    parser.add_argument('--duration_days', type=int, required=True, help='Contract duration in days')
    args = parser.parse_args()

    start_date = datetime.now()
    end_date = start_date + timedelta(days=args.duration_days)

    contract = f"""
SERVICE CONTRACT

Date: {start_date.strftime('%Y-%m-%d')}

This Service Contract ("Agreement") is entered into between:

Client: {args.client_name}
Contractor: {args.contractor_name}

1. Services. Contractor agrees to perform the following services: {args.scope}

2. Payment. Client agrees to pay Contractor ${args.payment_amount:.2f} for the services.

3. Term. This Agreement shall commence on {start_date.strftime('%Y-%m-%d')} and continue until {end_date.strftime('%Y-%m-%d')}, unless terminated earlier.

4. Independent Contractor. Contractor is an independent contractor, not an employee.

5. Governing Law. This Agreement shall be governed by the laws of the State of Delaware.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_________________________          _________________________
{args.client_name}                    {args.contractor_name}
"""

    with open('contract.txt', 'w') as f:
        f.write(contract)

    print('Contract drafted successfully: contract.txt')

if __name__ == '__main__':
    main()
