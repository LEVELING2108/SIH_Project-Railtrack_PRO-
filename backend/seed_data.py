"""
Seed script to populate database with 20 vendors and their track equipment
for testing and performance analysis.
"""
import json
from datetime import datetime, timedelta, date as dt_date
from extensions import db
from models import Vendor, TrackItem, Inspection, User


def get_random_date(start_year, end_year):
    """Generate a random date between start and end year"""
    start = dt_date(start_year, 1, 1)
    end = dt_date(end_year, 12, 31)
    delta = end - start
    random_days = delta.days // 2  # Just pick middle range for realism
    return start + timedelta(days=random_days)


def seed_vendors():
    """Create 20 vendors with diverse profiles"""
    
    vendors_data = [
        # High Performance Vendors (Low Risk)
        {
            'id': 'VEND001',
            'vendor_name': 'Indian Railways Manufacturing Co.',
            'vendor_code': 'IRMC-2020-001',
            'contact_person': 'Rajesh Kumar',
            'contact_email': 'rajesh@irmc.in',
            'contact_phone': '+91-9876543210',
            'address_line1': 'Plot 45, Industrial Area Phase-II',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'postal_code': '400001',
            'country': 'India',
            'tax_id': '27AABCI1234A1Z5',
            'bank_account': 'HDFC0001234567890',
            'certification_status': 'approved',
            'performance_rating': 4.8,
            'is_approved': True,
            'approval_date': dt_date(2020, 6, 15),
            'risk_profile': 'low'
        },
        {
            'id': 'VEND002',
            'vendor_name': 'Steel Tracks Industries',
            'vendor_code': 'STI-2019-002',
            'contact_person': 'Priya Sharma',
            'contact_email': 'priya@steeltracks.com',
            'contact_phone': '+91-9876543211',
            'address_line1': 'Sector 18, Industrial Estate',
            'city': 'Pune',
            'state': 'Maharashtra',
            'postal_code': '411001',
            'country': 'India',
            'tax_id': '27AABCS5678B1Z3',
            'bank_account': 'ICIC0002345678901',
            'certification_status': 'approved',
            'performance_rating': 4.6,
            'is_approved': True,
            'approval_date': dt_date(2019, 8, 20),
            'risk_profile': 'low'
        },
        {
            'id': 'VEND003',
            'vendor_name': 'Precision Rail Components',
            'vendor_code': 'PRC-2021-003',
            'contact_person': 'Amit Patel',
            'contact_email': 'amit@precisionrail.in',
            'contact_phone': '+91-9876543212',
            'address_line1': 'GIDC Estate, Vatva',
            'city': 'Ahmedabad',
            'state': 'Gujarat',
            'postal_code': '382445',
            'country': 'India',
            'tax_id': '24AABCP9012C1Z1',
            'bank_account': 'SBIN0003456789012',
            'certification_status': 'approved',
            'performance_rating': 4.7,
            'is_approved': True,
            'approval_date': dt_date(2021, 3, 10),
            'risk_profile': 'low'
        },
        {
            'id': 'VEND004',
            'vendor_name': 'Eastern Railway Supplies',
            'vendor_code': 'ERS-2018-004',
            'contact_person': 'Sunita Das',
            'contact_email': 'sunita@easternrailwaysupplies.com',
            'contact_phone': '+91-9876543213',
            'address_line1': 'Railway Colony, Zone Office Road',
            'city': 'Kolkata',
            'state': 'West Bengal',
            'postal_code': '700001',
            'country': 'India',
            'tax_id': '19AABCE3456D1Z9',
            'bank_account': 'UBIN0004567890123',
            'certification_status': 'approved',
            'performance_rating': 4.5,
            'is_approved': True,
            'approval_date': dt_date(2018, 11, 5),
            'risk_profile': 'low'
        },
        {
            'id': 'VEND005',
            'vendor_name': 'Southern Track Systems',
            'vendor_code': 'STS-2020-005',
            'contact_person': 'Venkatesh Iyer',
            'contact_email': 'venkatesh@southerntrack.in',
            'contact_phone': '+91-9876543214',
            'address_line1': 'Ambattur Industrial Estate',
            'city': 'Chennai',
            'state': 'Tamil Nadu',
            'postal_code': '600058',
            'country': 'India',
            'tax_id': '33AABCS7890E1Z7',
            'bank_account': 'CNRB0005678901234',
            'certification_status': 'approved',
            'performance_rating': 4.4,
            'is_approved': True,
            'approval_date': dt_date(2020, 1, 22),
            'risk_profile': 'low'
        },
        
        # Medium Risk Vendors
        {
            'id': 'VEND006',
            'vendor_name': 'Central India Rail Tech',
            'vendor_code': 'CIRT-2019-006',
            'contact_person': 'Ramesh Gupta',
            'contact_email': 'ramesh@centralindiarail.com',
            'contact_phone': '+91-9876543215',
            'address_line1': 'Mandideep Industrial Area',
            'city': 'Bhopal',
            'state': 'Madhya Pradesh',
            'postal_code': '462046',
            'country': 'India',
            'tax_id': '23AABCC1234F1Z5',
            'bank_account': 'HDFC0006789012345',
            'certification_status': 'approved',
            'performance_rating': 3.5,
            'is_approved': True,
            'approval_date': dt_date(2019, 5, 18),
            'risk_profile': 'medium'
        },
        {
            'id': 'VEND007',
            'vendor_name': 'Western Fasteners Ltd',
            'vendor_code': 'WFL-2020-007',
            'contact_person': 'Kiran Desai',
            'contact_email': 'kiran@westernfasteners.in',
            'contact_phone': '+91-9876543216',
            'address_line1': 'Sachin GIDC, Surat',
            'city': 'Surat',
            'state': 'Gujarat',
            'postal_code': '394230',
            'country': 'India',
            'tax_id': '24AABCW5678G1Z3',
            'bank_account': 'ICIC0007890123456',
            'certification_status': 'approved',
            'performance_rating': 3.2,
            'is_approved': True,
            'approval_date': dt_date(2020, 9, 12),
            'risk_profile': 'medium'
        },
        {
            'id': 'VEND008',
            'vendor_name': 'Northern Sleepers Corp',
            'vendor_code': 'NSC-2018-008',
            'contact_person': 'Harpreet Singh',
            'contact_email': 'harpreet@northernsleepers.com',
            'contact_phone': '+91-9876543217',
            'address_line1': 'Focal Point, Ludhiana',
            'city': 'Ludhiana',
            'state': 'Punjab',
            'postal_code': '141010',
            'country': 'India',
            'tax_id': '03AABCN9012H1Z1',
            'bank_account': 'SBIN0008901234567',
            'certification_status': 'approved',
            'performance_rating': 3.0,
            'is_approved': True,
            'approval_date': dt_date(2018, 4, 25),
            'risk_profile': 'medium'
        },
        {
            'id': 'VEND009',
            'vendor_name': 'Deccan Rail Products',
            'vendor_code': 'DRP-2021-009',
            'contact_person': 'Lakshmi Narayan',
            'contact_email': 'lakshmi@deccanrail.in',
            'contact_phone': '+91-9876543218',
            'address_line1': 'Jeedimetla Industrial Area',
            'city': 'Hyderabad',
            'state': 'Telangana',
            'postal_code': '500055',
            'country': 'India',
            'tax_id': '36AABCD3456I1Z9',
            'bank_account': 'UBIN0009012345678',
            'certification_status': 'approved',
            'performance_rating': 3.3,
            'is_approved': True,
            'approval_date': dt_date(2021, 7, 8),
            'risk_profile': 'medium'
        },
        {
            'id': 'VEND010',
            'vendor_name': 'Coastal Railway Supplies',
            'vendor_code': 'CRS-2019-010',
            'contact_person': 'Francis D Souza',
            'contact_email': 'francis@coastalrailway.com',
            'contact_phone': '+91-9876543219',
            'address_line1': 'Kundapur Industrial Zone',
            'city': 'Mangalore',
            'state': 'Karnataka',
            'postal_code': '574101',
            'country': 'India',
            'tax_id': '29AABCC7890J1Z7',
            'bank_account': 'CNRB0000123456789',
            'certification_status': 'approved',
            'performance_rating': 3.4,
            'is_approved': True,
            'approval_date': dt_date(2019, 12, 3),
            'risk_profile': 'medium'
        },
        
        # High Risk Vendors
        {
            'id': 'VEND011',
            'vendor_name': 'Quick Rail Solutions',
            'vendor_code': 'QRS-2022-011',
            'contact_person': 'Vikram Malhotra',
            'contact_email': 'vikram@quickrail.in',
            'contact_phone': '+91-9876543220',
            'address_line1': 'Sector 25, IMT Manesar',
            'city': 'Gurugram',
            'state': 'Haryana',
            'postal_code': '122016',
            'country': 'India',
            'tax_id': '06AABCQ1234K1Z5',
            'bank_account': 'HDFC0001234567890',
            'certification_status': 'pending',
            'performance_rating': 2.1,
            'is_approved': False,
            'approval_date': None,
            'risk_profile': 'high'
        },
        {
            'id': 'VEND012',
            'vendor_name': 'Budget Track Components',
            'vendor_code': 'BTC-2021-012',
            'contact_person': 'Suresh Yadav',
            'contact_email': 'suresh@budgettrack.com',
            'contact_phone': '+91-9876543221',
            'address_line1': 'RIICO Industrial Area',
            'city': 'Jaipur',
            'state': 'Rajasthan',
            'postal_code': '302013',
            'country': 'India',
            'tax_id': '08AABCB5678L1Z3',
            'bank_account': 'ICIC0002345678901',
            'certification_status': 'pending',
            'performance_rating': 2.3,
            'is_approved': False,
            'approval_date': None,
            'risk_profile': 'high'
        },
        {
            'id': 'VEND013',
            'vendor_name': 'Metro Rail Vendors',
            'vendor_code': 'MRV-2020-013',
            'contact_person': 'Anita Kulkarni',
            'contact_email': 'anita@metrorailvendors.in',
            'contact_phone': '+91-9876543222',
            'address_line1': 'Peenya Industrial Area',
            'city': 'Bangalore',
            'state': 'Karnataka',
            'postal_code': '560058',
            'country': 'India',
            'tax_id': '29AABCM9012M1Z1',
            'bank_account': 'SBIN0003456789012',
            'certification_status': 'pending',
            'performance_rating': 2.5,
            'is_approved': False,
            'approval_date': None,
            'risk_profile': 'high'
        },
        {
            'id': 'VEND014',
            'vendor_name': 'Eastern Components Works',
            'vendor_code': 'ECW-2019-014',
            'contact_person': 'Dipak Chatterjee',
            'contact_email': 'dipak@easterncomponents.com',
            'contact_phone': '+91-9876543223',
            'address_line1': 'Belur Industrial Estate',
            'city': 'Howrah',
            'state': 'West Bengal',
            'postal_code': '711201',
            'country': 'India',
            'tax_id': '19AABCE3456N1Z9',
            'bank_account': 'UBIN0004567890123',
            'certification_status': 'blacklisted',
            'performance_rating': 1.8,
            'is_approved': False,
            'approval_date': None,
            'risk_profile': 'high'
        },
        {
            'id': 'VEND015',
            'vendor_name': 'Rapid Rail Industries',
            'vendor_code': 'RRI-2022-015',
            'contact_person': 'Mohd. Aslam',
            'contact_email': 'aslam@rapidrail.in',
            'contact_phone': '+91-9876543224',
            'address_line1': 'Tughlakabad Industrial Area',
            'city': 'New Delhi',
            'state': 'Delhi',
            'postal_code': '110044',
            'country': 'India',
            'tax_id': '07AABCR7890O1Z7',
            'bank_account': 'CNRB0005678901234',
            'certification_status': 'pending',
            'performance_rating': 2.0,
            'is_approved': False,
            'approval_date': None,
            'risk_profile': 'high'
        },
        
        # Additional Mixed Risk Vendors
        {
            'id': 'VEND016',
            'vendor_name': 'Himalayan Track Works',
            'vendor_code': 'HTW-2020-016',
            'contact_person': 'Tenzin Dorje',
            'contact_email': 'tenzin@himalayantrack.in',
            'contact_phone': '+91-9876543225',
            'address_line1': 'Parwanoo Industrial Area',
            'city': 'Solan',
            'state': 'Himachal Pradesh',
            'postal_code': '173220',
            'country': 'India',
            'tax_id': '02AABCH1234P1Z5',
            'bank_account': 'HDFC0006789012345',
            'certification_status': 'approved',
            'performance_rating': 3.8,
            'is_approved': True,
            'approval_date': dt_date(2020, 10, 15),
            'risk_profile': 'medium'
        },
        {
            'id': 'VEND017',
            'vendor_name': 'Gangetic Steel Works',
            'vendor_code': 'GSW-2018-017',
            'contact_person': 'Pankaj Singh',
            'contact_email': 'pankaj@gangeticsteel.com',
            'contact_phone': '+91-9876543226',
            'address_line1': 'Sarai Mir Industrial Zone',
            'city': 'Varanasi',
            'state': 'Uttar Pradesh',
            'postal_code': '221006',
            'country': 'India',
            'tax_id': '09AABCG5678Q1Z3',
            'bank_account': 'ICIC0007890123456',
            'certification_status': 'approved',
            'performance_rating': 3.6,
            'is_approved': True,
            'approval_date': dt_date(2018, 7, 22),
            'risk_profile': 'medium'
        },
        {
            'id': 'VEND018',
            'vendor_name': 'Konkan Rail Technologies',
            'vendor_code': 'KRT-2021-018',
            'contact_person': 'Nilesh Naik',
            'contact_email': 'nilesh@konkanrail.tech',
            'contact_phone': '+91-9876543227',
            'address_line1': 'Verna Industrial Estate',
            'city': 'Panaji',
            'state': 'Goa',
            'postal_code': '403722',
            'country': 'India',
            'tax_id': '30AABCK9012R1Z1',
            'bank_account': 'SBIN0008901234567',
            'certification_status': 'approved',
            'performance_rating': 4.0,
            'is_approved': True,
            'approval_date': dt_date(2021, 2, 28),
            'risk_profile': 'low'
        },
        {
            'id': 'VEND019',
            'vendor_name': 'Thar Desert Rail Co',
            'vendor_code': 'TDRC-2019-019',
            'contact_person': 'Gopal Chand',
            'contact_email': 'gopal@thardesertrail.in',
            'contact_phone': '+91-9876543228',
            'address_line1': 'Boranda Industrial Area',
            'city': 'Jodhpur',
            'state': 'Rajasthan',
            'postal_code': '342011',
            'country': 'India',
            'tax_id': '08AABCT3456S1Z9',
            'bank_account': 'UBIN0009012345678',
            'certification_status': 'approved',
            'performance_rating': 3.1,
            'is_approved': True,
            'approval_date': dt_date(2019, 6, 14),
            'risk_profile': 'medium'
        },
        {
            'id': 'VEND020',
            'vendor_name': 'Northeast Frontier Supplies',
            'vendor_code': 'NFS-2020-020',
            'contact_person': 'Bimal Barua',
            'contact_email': 'bimal@nefrontier.com',
            'contact_phone': '+91-9876543229',
            'address_line1': 'Fatasil Industrial Area',
            'city': 'Guwahati',
            'state': 'Assam',
            'postal_code': '781003',
            'country': 'India',
            'tax_id': '18AABCN7890T1Z7',
            'bank_account': 'CNRB0000123456789',
            'certification_status': 'approved',
            'performance_rating': 3.7,
            'is_approved': True,
            'approval_date': dt_date(2020, 4, 10),
            'risk_profile': 'medium'
        }
    ]
    
    created_vendors = []
    for vendor_data in vendors_data:
        risk_profile = vendor_data.pop('risk_profile', 'medium')
        
        # Check if vendor already exists
        existing = Vendor.query.get(vendor_data['id'])
        if existing:
            print(f"Vendor {vendor_data['id']} already exists, skipping...")
            continue
        
        vendor = Vendor(**vendor_data)
        db.session.add(vendor)
        created_vendors.append({
            'vendor': vendor,
            'risk_profile': risk_profile
        })
    
    db.session.commit()
    print(f"Created {len(created_vendors)} vendors")
    return created_vendors


def seed_track_items(vendors):
    """Create track items for each vendor"""
    
    item_types = ['elastic_rail_clip', 'rail_pad', 'liner', 'sleeper']
    
    specifications = {
        'elastic_rail_clip': {
            'material': 'Spring Steel 55Si2Mn1',
            'tensile_strength': '1400-1600 N/mm²',
            'hardness': '42-48 HRC',
            'size': '52kg/60kg rail section',
            'coating': 'Zinc phosphate with epoxy',
            'standard': 'RDSO T-102'
        },
        'rail_pad': {
            'material': 'EVA/ Rubber compound',
            'thickness': '10mm',
            'hardness': '55-65 Shore A',
            'static_stiffness': '230-270 kN/mm',
            'dynamic_stiffness': '350-400 kN/mm',
            'electrical_resistance': '>10^6 ohm',
            'standard': 'RDSO T-98'
        },
        'liner': {
            'material': 'Nylon 6/6 with MoS2',
            'tensile_strength': '>80 N/mm²',
            'hardness': '65-70 Shore D',
            'size': '52kg/60kg rail section',
            'friction_coefficient': '<0.15',
            'standard': 'RDSO T-106'
        },
        'sleeper': {
            'material': 'Pre-stressed Concrete M60',
            'length': '2750mm',
            'width': '255mm (center) / 155mm (end)',
            'depth': '205mm',
            'prestressing_force': '45 tonnes',
            'design_life': '50 years',
            'standard': 'RDSO T-22'
        }
    }
    
    locations = [
        {'section': 'Mumbai-Delhi Main Line', 'km_from': 145.5, 'km_to': 150.0, 'division': 'Mumbai', 'zone': 'Central Railway'},
        {'section': 'Howrah-Gaya Line', 'km_from': 78.2, 'km_to': 82.5, 'division': 'Howrah', 'zone': 'Eastern Railway'},
        {'section': 'Chennai-Bangalore Route', 'km_from': 210.0, 'km_to': 215.8, 'division': 'Chennai', 'zone': 'Southern Railway'},
        {'section': 'Delhi-Kalka Line', 'km_from': 45.0, 'km_to': 50.2, 'division': 'Delhi', 'zone': 'Northern Railway'},
        {'section': 'Ahmedabad-Vadodara', 'km_from': 98.5, 'km_to': 105.0, 'division': 'Ahmedabad', 'zone': 'Western Railway'},
        {'section': 'Secunderabad-Nagpur', 'km_from': 156.0, 'km_to': 162.3, 'division': 'Secunderabad', 'zone': 'South Central Railway'},
        {'section': 'Lucknow-Varanasi', 'km_from': 200.5, 'km_to': 208.0, 'division': 'Lucknow', 'zone': 'Northern Railway'},
        {'section': 'Jaipur-Ajmer', 'km_from': 67.0, 'km_to': 72.5, 'division': 'Jaipur', 'zone': 'North Western Railway'},
        {'section': 'Pune-Solapur', 'km_from': 112.0, 'km_to': 118.7, 'division': 'Pune', 'zone': 'Central Railway'},
        {'section': 'Guwahati-Dibrugarh', 'km_from': 320.0, 'km_to': 328.5, 'division': 'Guwahati', 'zone': 'Northeast Frontier Railway'},
    ]
    
    created_items = []
    
    for vendor_info in vendors:
        vendor = vendor_info['vendor']
        risk_profile = vendor_info['risk_profile']
        
        # Create 2-4 track items per vendor based on risk profile
        num_items = 2 if risk_profile == 'high' else (3 if risk_profile == 'medium' else 4)
        
        for i in range(num_items):
            item_type = item_types[i % 4]
            location = locations[i % len(locations)]
            
            # Generate dates based on risk profile
            if risk_profile == 'low':
                manufacture_date = dt_date(2023, 1, 15)
                supply_date = dt_date(2023, 2, 1)
                installation_date = dt_date(2023, 3, 10)
                defect_count = 0
                replacement_count = 0
                performance_status = 'good'
                warranty_years = 10
            elif risk_profile == 'medium':
                manufacture_date = dt_date(2022, 6, 20)
                supply_date = dt_date(2022, 7, 15)
                installation_date = dt_date(2022, 8, 25)
                defect_count = 2
                replacement_count = 1
                performance_status = 'average'
                warranty_years = 7
            else:  # high risk
                manufacture_date = dt_date(2021, 3, 10)
                supply_date = dt_date(2021, 5, 5)
                installation_date = dt_date(2021, 6, 20)
                defect_count = 8
                replacement_count = 3
                performance_status = 'poor'
                warranty_years = 5
            
            # Create unique lot number
            lot_number = f"LOT-{vendor.id}-{item_type[:3].upper()}-{2020 + i}"
            
            # Check if item already exists
            existing = TrackItem.query.filter_by(lot_number=lot_number).first()
            if existing:
                print(f"Track item {lot_number} already exists, skipping...")
                continue
            
            track_item = TrackItem(
                id=f"ITEM-{vendor.id}-{i+1:03d}",
                item_type=item_type,
                lot_number=lot_number,
                vendor_id=vendor.id,
                quantity=500 if item_type != 'sleeper' else 200,
                manufacture_date=manufacture_date,
                supply_date=supply_date,
                installation_date=installation_date,
                warranty_period_years=warranty_years,
                warranty_start_date=installation_date,
                warranty_expiry_date=installation_date + timedelta(days=warranty_years*365),
                installation_location=location['section'],
                kilometer_from=location['km_from'],
                kilometer_to=location['km_to'],
                section_name=location['section'],
                division=location['division'],
                zone=location['zone'],
                status='in_service',
                performance_status=performance_status,
                defect_count=defect_count,
                replacement_count=replacement_count,
                specifications=json.dumps(specifications[item_type]),
                details=f"Batch {i+1} from {vendor.vendor_name}. Performance: {performance_status}.",
                notes=f"Risk profile: {risk_profile}. Monitor for quality issues." if risk_profile == 'high' else 'Regular maintenance schedule.'
            )
            
            db.session.add(track_item)
            created_items.append(track_item)
    
    db.session.commit()
    print(f"Created {len(created_items)} track items")
    return created_items


def seed_inspections(track_items):
    """Create inspection records for track items"""
    
    inspection_types = ['manufacturing', 'supply', 'installation', 'periodic']
    statuses = ['passed', 'passed', 'passed', 'conditional', 'failed']
    grades = ['A', 'B', 'C', 'D', 'F']
    
    created_inspections = []
    
    for item in track_items:
        # Create 2-3 inspections per item
        num_inspections = 3 if item.performance_status == 'good' else 2
        
        for i in range(num_inspections):
            inspection_type = inspection_types[i] if i < len(inspection_types) else 'periodic'
            
            # Base dates on item dates
            if inspection_type == 'manufacturing':
                insp_date = item.manufacture_date - timedelta(days=5)
            elif inspection_type == 'supply':
                insp_date = item.supply_date - timedelta(days=2)
            elif inspection_type == 'installation':
                insp_date = item.installation_date
            else:
                insp_date = item.installation_date + timedelta(days=90)
            
            # Determine status based on item performance and random factor
            if item.performance_status == 'good':
                status = 'passed'
                grade = 'A' if i == 0 else 'B'
            elif item.performance_status == 'average':
                status = 'passed' if i < 2 else 'conditional'
                grade = 'B' if i == 0 else 'C'
            else:  # poor
                status = 'failed' if i == num_inspections - 1 else 'conditional'
                grade = 'D' if i < 2 else 'F'
            
            # Check if inspection already exists
            existing = Inspection.query.filter_by(
                track_item_id=item.id,
                inspection_type=inspection_type,
                inspection_date=insp_date
            ).first()
            
            if existing:
                continue
            
            defects = []
            remarks = 'All parameters within acceptable limits.'
            
            if status == 'conditional':
                defects = ['Minor surface defects', 'Dimensional variation within tolerance']
                remarks = 'Accepted with conditions. Monitor closely.'
            elif status == 'failed':
                defects = ['Crack detected in sample', 'Hardness below specification', 'Coating thickness inadequate']
                remarks = 'Batch rejected. Re-inspection required.'
            
            inspection = Inspection(
                track_item_id=item.id,
                inspection_type=inspection_type,
                inspection_date=insp_date,
                inspector_name=f'Inspector {chr(65 + i)}',
                inspector_designation='Senior Quality Inspector',
                inspection_status=status,
                quality_grade=grade,
                remarks=remarks,
                defects_found=json.dumps(defects) if defects else None,
                action_taken='Approved for use' if status == 'passed' else 'Quarantine and review',
                next_inspection_due=insp_date + timedelta(days=180),
                document_references=json.dumps([f'INSPECTION-{item.lot_number}-{inspection_type}.pdf'])
            )
            
            db.session.add(inspection)
            created_inspections.append(inspection)
    
    db.session.commit()
    print(f"Created {len(created_inspections)} inspection records")
    return created_inspections


def seed_all():
    """Main function to seed all data"""
    print("Starting data seeding...")
    print("=" * 50)
    
    print("\n1. Seeding vendors...")
    vendors = seed_vendors()
    
    print("\n2. Seeding track items...")
    track_items = seed_track_items(vendors)
    
    print("\n3. Seeding inspections...")
    inspections = seed_inspections(track_items)
    
    print("\n" + "=" * 50)
    print("Seeding completed successfully!")
    print(f"Total vendors: {len(vendors)}")
    print(f"Total track items: {len(track_items)}")
    print(f"Total inspections: {len(inspections)}")
    print("=" * 50)
    
    return {
        'vendors': vendors,
        'track_items': track_items,
        'inspections': inspections
    }


if __name__ == '__main__':
    from app import create_app
    app = create_app()
    
    with app.app_context():
        seed_all()
